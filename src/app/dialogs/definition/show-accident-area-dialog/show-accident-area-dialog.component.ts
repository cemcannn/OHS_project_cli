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

@Component({
  selector: 'app-show-accident-area-dialog',
  templateUrl: './show-accident-area-dialog.component.html',
  styleUrls: ['./show-accident-area-dialog.component.scss']
})
export class ShowAccidentAreaDialogComponent extends BaseDialog<ShowAccidentAreaDialogComponent> implements OnInit {
  displayedColumns: string[] = ['accidentArea', 'actions'];
  dataSource: MatTableDataSource<List_Accident_Area> = new MatTableDataSource<List_Accident_Area>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null; // Düzenleme modunda olan satırın indeksi
  newAccidentArea: string = ''; // Yeni kaza türü eklemek için

  constructor(
    dialogRef: MatDialogRef<ShowAccidentAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentAreaService: AccidentAreaService,
    private alertifyService: AlertifyService
  ) {
    super(dialogRef);
  }

  async ngOnInit(): Promise<void> {
    await this.showAccidentAreas();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showAccidentAreas(): Promise<void> {
    try {
      const allAccidentAreas = await this.accidentAreaService.getAccidentAreas();
      this.dataSource.data = allAccidentAreas.datas;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Kaza türü bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    }
  }

  selectAccidentArea(accident: List_Accident_Area): void {
    if (this.data.isPicker) {
      this.dialogRef.close(accident);
    }
  }

  startEdit(index: number): void {
    this.editIndex = index;
  }

  async saveEdit(element: List_Accident_Area): Promise<void> {
    const updatedAccidentArea: Update_Accident_Area = {
      id: element.id,
      name: element.name // Güncellenen kaza türü adı
    };

    try {
      await this.accidentAreaService.updateAccidentArea(updatedAccidentArea);
      this.alertifyService.message('Kaza türü başarıyla güncellendi.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.editIndex = null; // Düzenleme modunu kapat
      await this.showAccidentAreas(); // Güncellenen kaza türünü yükleme
    } catch (error) {
      this.alertifyService.message('Kaza türü güncellenirken bir hata oluştu.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    }
  }

  cancelEdit(): void {
    this.editIndex = null;
  }

  async createAccidentArea(): Promise<void> {
    const newAccidentArea: Create_Accident_Area = {
      name: this.newAccidentArea // Yeni kaza türü adı
    };

    try {
      await this.accidentAreaService.createAccidentArea(newAccidentArea);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.newAccidentArea = ''; // Giriş alanını temizleme
      await this.showAccidentAreas(); // Yeni kaza türünü yükleme
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
