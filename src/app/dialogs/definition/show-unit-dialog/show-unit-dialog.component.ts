import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MatTableDataSource } from '@angular/material/table';
import { List_Unit } from 'src/app/contracts/definitions/unit/list_unit';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UnitService } from 'src/app/services/common/models/unit.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Unit } from 'src/app/contracts/definitions/unit/update_unit';
import { Create_Unit } from 'src/app/contracts/definitions/unit/create_unit';

@Component({
  selector: 'app-show-unit-dialog',
  templateUrl: './show-unit-dialog.component.html',
  styleUrls: ['./show-unit-dialog.component.scss']
})
export class ShowUnitDialogComponent extends BaseDialog<ShowUnitDialogComponent> implements OnInit {
  displayedColumns: string[] = ['unit', 'actions'];
  dataSource: MatTableDataSource<List_Unit> = new MatTableDataSource<List_Unit>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null; // Düzenleme modunda olan satırın indeksi
  newUnit: string = ''; // Yeni kaza türü eklemek için

  constructor(
    dialogRef: MatDialogRef<ShowUnitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private unitService: UnitService,
    private alertifyService: AlertifyService,
  ) {
    super(dialogRef);
  }

  async ngOnInit(){
    await this.showUnits();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showUnits(): Promise<void> {
    try {
      const allUnits = await this.unitService.getUnits();
      this.dataSource.data = allUnits.datas;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Uzuv bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    }
  }

  selectUnit(accident: List_Unit): void {
    if (this.data.isPicker) {
      this.dialogRef.close(accident);
    }
  }

  startEdit(index: number): void {
    this.editIndex = index;
  }

  async saveEdit(element: List_Unit): Promise<void> {
    const updatedUnit: Update_Unit = {
      id: element.id,
      name: element.name // Güncellenen kaza türü adı
    };

    try {
      await this.unitService.updateUnit(updatedUnit);
      this.alertifyService.message('Uzuv türü başarıyla güncellendi.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.editIndex = null; // Düzenleme modunu kapat
      await this.showUnits(); // Güncellenen kaza türünü yükleme
    } catch (error) {
      this.alertifyService.message('Uzuv türü güncellenirken bir hata oluştu.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    }
  }

  cancelEdit(): void {
    this.editIndex = null;
  }

  async createUnit(): Promise<void> {
    const newUnit: Create_Unit = {
      name: this.newUnit // Yeni kaza türü adı
    };

    try {
      await this.unitService.createUnit(newUnit);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.newUnit = ''; // Giriş alanını temizleme
      await this.showUnits(); // Yeni kaza türünü yükleme
    } catch (error) {
      this.alertifyService.message('Kaza türü oluşturulurken bir hata oluştu.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
