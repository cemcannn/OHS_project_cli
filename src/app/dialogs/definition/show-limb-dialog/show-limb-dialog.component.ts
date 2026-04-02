import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { List_Limb } from 'src/app/contracts/definitions/limb/list_limb';
import { BaseDialog } from '../../base/base-dialog';
import { LimbService } from 'src/app/services/common/models/limb.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Limb } from 'src/app/contracts/definitions/limb/update_limb';
import { Create_Limb } from 'src/app/contracts/definitions/limb/create_limb';

interface LimbVm extends List_Limb {
  code?: string;
  plainDescription: string;
}

@Component({
  selector: 'app-show-limb-dialog',
  templateUrl: './show-limb-dialog.component.html',
  styleUrls: ['./show-limb-dialog.component.scss']
})
export class ShowLimbDialogComponent extends BaseDialog<ShowLimbDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';

  displayedColumns: string[] = ['code', 'name', 'description', 'actions'];
  dataSource: MatTableDataSource<LimbVm> = new MatTableDataSource<LimbVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newLimbCode: string = '';
  newLimb: string = '';
  newLimbDescription: string = '';

  constructor(
    dialogRef: MatDialogRef<ShowLimbDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private limbService: LimbService,
    private alertifyService: AlertifyService,
  ) {
    super(dialogRef);
  }

  async ngOnInit() { await this.showLimbs(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showLimbs(): Promise<void> {
    try {
      const allLimbs = await this.limbService.getLimbs();
      this.dataSource.data = allLimbs.datas.map(item => this.toVm(item));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Uzuv bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  selectLimb(limb: LimbVm): void {
    if (this.data.isPicker) this.dialogRef.close(limb);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: LimbVm): Promise<void> {
    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const updatedLimb: Update_Limb = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.plainDescription)
    };
    try {
      await this.limbService.updateLimb(updatedLimb);
      this.alertifyService.message('Uzuv başarıyla güncellendi.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.editIndex = null;
      await this.showLimbs();
    } catch (error) {
      this.alertifyService.message('Uzuv güncellenirken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  cancelEdit(): void { this.editIndex = null; }

  async createLimb(): Promise<void> {
    if (this.hasCodeConflict(this.newLimbCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newLimb: Create_Limb = {
      name: this.newLimb,
      description: this.encodeDescription(this.newLimbCode, this.newLimbDescription)
    };
    try {
      await this.limbService.createLimb(newLimb);
      this.alertifyService.message('Uzuv başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newLimbCode = '';
      this.newLimb = '';
      this.newLimbDescription = '';
      await this.showLimbs();
    } catch (error) {
      this.alertifyService.message('Uzuv oluşturulurken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private toVm(item: List_Limb): LimbVm {
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
