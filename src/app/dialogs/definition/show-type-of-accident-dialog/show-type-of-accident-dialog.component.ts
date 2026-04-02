import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MatTableDataSource } from '@angular/material/table';
import { List_Type_Of_Accident } from 'src/app/contracts/definitions/type_of_accident/list_type_of_accident';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { TypeOfAccidentService } from 'src/app/services/common/models/type-of-accident.service';
import { Create_Type_Of_Accident } from 'src/app/contracts/definitions/type_of_accident/create_type_of_accident';
import { Update_Type_Of_Accident } from 'src/app/contracts/definitions/type_of_accident/update_type_of_accident';

interface TypeOfAccidentVm extends List_Type_Of_Accident {
  code?: string;
  plainDescription: string;
}

@Component({
  selector: 'app-show-type-of-accident-dialog',
  templateUrl: './show-type-of-accident-dialog.component.html',
  styleUrls: ['./show-type-of-accident-dialog.component.scss']
})
export class ShowTypeOfAccidentDialogComponent extends BaseDialog<ShowTypeOfAccidentDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';

  displayedColumns: string[] = ['code', 'name', 'description', 'actions'];
  dataSource: MatTableDataSource<TypeOfAccidentVm> = new MatTableDataSource<TypeOfAccidentVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newTypeOfAccidentCode: string = '';
  newTypeOfAccident: string = '';
  newTypeOfAccidentDescription: string = '';

  constructor(
    dialogRef: MatDialogRef<ShowTypeOfAccidentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private typeOfAccidentService: TypeOfAccidentService,
    private alertifyService: AlertifyService
  ) {
    super(dialogRef);
  }

  async ngOnInit(): Promise<void> {
    await this.showTypeOfAccidents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showTypeOfAccidents(): Promise<void> {
    try {
      const allTypeOfAccidents = await this.typeOfAccidentService.getTypeOfAccidents();
      this.dataSource.data = allTypeOfAccidents.datas.map(item => this.toVm(item));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Kaza türü bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  selectTypeOfAccident(accident: TypeOfAccidentVm): void {
    if (this.data.isPicker) this.dialogRef.close(accident);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: TypeOfAccidentVm): Promise<void> {
    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const updatedTypeOfAccident: Update_Type_Of_Accident = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.plainDescription)
    };
    try {
      await this.typeOfAccidentService.updateTypeOfAccident(updatedTypeOfAccident);
      this.alertifyService.message('Kaza türü başarıyla güncellendi.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.editIndex = null;
      await this.showTypeOfAccidents();
    } catch (error) {
      this.alertifyService.message('Kaza türü güncellenirken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  cancelEdit(): void { this.editIndex = null; }

  async createTypeOfAccident(): Promise<void> {
    if (this.hasCodeConflict(this.newTypeOfAccidentCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newTypeOfAccident: Create_Type_Of_Accident = {
      name: this.newTypeOfAccident,
      description: this.encodeDescription(this.newTypeOfAccidentCode, this.newTypeOfAccidentDescription)
    };
    try {
      await this.typeOfAccidentService.createTypeOfAccident(newTypeOfAccident);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newTypeOfAccidentCode = '';
      this.newTypeOfAccident = '';
      this.newTypeOfAccidentDescription = '';
      await this.showTypeOfAccidents();
    } catch (error) {
      this.alertifyService.message('Kaza türü oluşturulurken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private toVm(item: List_Type_Of_Accident): TypeOfAccidentVm {
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
