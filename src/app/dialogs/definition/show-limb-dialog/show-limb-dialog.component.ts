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

@Component({
  selector: 'app-show-limb-dialog',
  templateUrl: './show-limb-dialog.component.html',
  styleUrls: ['./show-limb-dialog.component.scss']
})
export class ShowLimbDialogComponent extends BaseDialog<ShowLimbDialogComponent> implements OnInit {
  displayedColumns: string[] = ['limb', 'actions'];
  dataSource: MatTableDataSource<List_Limb> = new MatTableDataSource<List_Limb>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
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
      this.dataSource.data = allLimbs.datas;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Uzuv bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  selectLimb(limb: List_Limb): void {
    if (this.data.isPicker) this.dialogRef.close(limb);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: List_Limb): Promise<void> {
    const updatedLimb: Update_Limb = {
      id: element.id,
      name: element.name,
      description: element.description
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
    const newLimb: Create_Limb = {
      name: this.newLimb,
      description: this.newLimbDescription
    };
    try {
      await this.limbService.createLimb(newLimb);
      this.alertifyService.message('Uzuv başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
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
}
