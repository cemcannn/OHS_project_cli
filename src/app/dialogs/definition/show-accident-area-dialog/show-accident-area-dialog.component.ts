import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MatTableDataSource } from '@angular/material/table';
import { List_Accident_Area } from 'src/app/contracts/definitions/accident_area/list_accident_area';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentAreaService } from 'src/app/services/common/models/accident-area.service';
import { Create_Accident_Area } from 'src/app/contracts/definitions/accident_area/create_accident_area';
import { Update_Accident_Area } from 'src/app/contracts/definitions/accident_area/update_accident_area';

interface AccidentAreaVm extends List_Accident_Area {
  code?: string;
  plainDescription: string;
}

@Component({
  selector: 'app-show-accident-area-dialog',
  templateUrl: './show-accident-area-dialog.component.html',
  styleUrls: ['./show-accident-area-dialog.component.scss']
})
export class ShowAccidentAreaDialogComponent extends BaseDialog<ShowAccidentAreaDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';

  displayedColumns: string[] = ['code', 'name', 'description', 'actions'];
  dataSource: MatTableDataSource<AccidentAreaVm> = new MatTableDataSource<AccidentAreaVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newAccidentAreaCode: string = '';
  newAccidentArea: string = '';
  newAccidentAreaDescription: string = '';

  constructor(
    dialogRef: MatDialogRef<ShowAccidentAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentAreaService: AccidentAreaService,
    private alertifyService: AlertifyService
  ) {
    super(dialogRef);
  }

  async ngOnInit(): Promise<void> { await this.showAccidentAreas(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showAccidentAreas(): Promise<void> {
    try {
      const allAccidentAreas = await this.accidentAreaService.getAccidentAreas();
      this.dataSource.data = allAccidentAreas.datas.map(item => this.toVm(item));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Kaza yeri bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  selectAccidentArea(accident: AccidentAreaVm): void {
    if (this.data.isPicker) this.dialogRef.close(accident);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: AccidentAreaVm): Promise<void> {
    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const updatedAccidentArea: Update_Accident_Area = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.plainDescription)
    };
    try {
      await this.accidentAreaService.updateAccidentArea(updatedAccidentArea);
      this.alertifyService.message('Kaza yeri başarıyla güncellendi.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.editIndex = null;
      await this.showAccidentAreas();
    } catch (error) {
      this.alertifyService.message('Kaza yeri güncellenirken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  cancelEdit(): void { this.editIndex = null; }

  async createAccidentArea(): Promise<void> {
    if (this.hasCodeConflict(this.newAccidentAreaCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newAccidentArea: Create_Accident_Area = {
      name: this.newAccidentArea,
      description: this.encodeDescription(this.newAccidentAreaCode, this.newAccidentAreaDescription)
    };
    try {
      await this.accidentAreaService.createAccidentArea(newAccidentArea);
      this.alertifyService.message('Kaza yeri başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newAccidentAreaCode = '';
      this.newAccidentArea = '';
      this.newAccidentAreaDescription = '';
      await this.showAccidentAreas();
    } catch (error) {
      this.alertifyService.message('Kaza yeri oluşturulurken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private toVm(item: List_Accident_Area): AccidentAreaVm {
    const decoded = this.decodeDescription(item.description);
    return {
      ...item,
      code: decoded.code,
      plainDescription: decoded.description,
      description: item.description
    };
  }

  private encodeDescription(code: string | undefined, description: string | undefined): string {
    const cleanCode = (code ?? '').trim();
    const cleanDescription = description ?? '';
    if (!cleanCode) {
      return cleanDescription;
    }
    return `${this.codePrefix}${cleanCode}\n${cleanDescription}`;
  }

  private decodeDescription(raw: string | undefined): { code?: string; description: string } {
    const value = raw ?? '';
    if (!value.startsWith(this.codePrefix)) {
      return { description: value };
    }

    const body = value.substring(this.codePrefix.length);
    const lineBreakIndex = body.indexOf('\n');
    if (lineBreakIndex === -1) {
      return { code: body.trim(), description: '' };
    }

    return {
      code: body.substring(0, lineBreakIndex).trim(),
      description: body.substring(lineBreakIndex + 1)
    };
  }

  private hasCodeConflict(code: string | undefined, currentId?: string): boolean {
    const cleanCode = (code ?? '').trim().toLowerCase();
    if (!cleanCode) {
      return false;
    }

    return this.dataSource.data.some(item =>
      item.id !== currentId &&
      (item.code ?? '').trim().toLowerCase() === cleanCode
    );
  }
}
