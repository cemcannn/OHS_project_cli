import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { BaseDialog } from '../../base/base-dialog';
import { DirectorateService } from 'src/app/services/common/models/directorate.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Directorate } from 'src/app/contracts/definitions/directorate/update_directorate';
import { Create_Directorate } from 'src/app/contracts/definitions/directorate/create_directorate';

@Component({
  selector: 'app-show-directorate-dialog',
  templateUrl: './show-directorate-dialog.component.html',
  styleUrls: ['./show-directorate-dialog.component.scss']
})
export class ShowDirectorateDialogComponent extends BaseDialog<ShowDirectorateDialogComponent> implements OnInit {
  displayedColumns: string[] = ['directorate', 'actions'];
  dataSource: MatTableDataSource<List_Directorate> = new MatTableDataSource<List_Directorate>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null; // Düzenleme modunda olan satırın indeksi
  newDirectorate: string = ''; // Yeni kaza türü eklemek için

  constructor(
    dialogRef: MatDialogRef<ShowDirectorateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private directorateService: DirectorateService,
    private alertifyService: AlertifyService,
  ) {
    super(dialogRef);
  }

  async ngOnInit(){
    await this.showDirectorates();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showDirectorates(): Promise<void> {
    try {
      const allDirectorates = await this.directorateService.getDirectorates();
      this.dataSource.data = allDirectorates.datas;
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

  selectDirectorate(accident: List_Directorate): void {
    if (this.data.isPicker) {
      this.dialogRef.close(accident);
    }
  }

  startEdit(index: number): void {
    this.editIndex = index;
  }

  async saveEdit(element: List_Directorate): Promise<void> {
    const updatedDirectorate: Update_Directorate = {
      id: element.id,
      name: element.name // Güncellenen kaza türü adı
    };

    try {
      await this.directorateService.updateDirectorate(updatedDirectorate);
      this.alertifyService.message('Uzuv türü başarıyla güncellendi.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.editIndex = null; // Düzenleme modunu kapat
      await this.showDirectorates(); // Güncellenen kaza türünü yükleme
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

  async createDirectorate(): Promise<void> {
    const newDirectorate: Create_Directorate = {
      name: this.newDirectorate // Yeni kaza türü adı
    };

    try {
      await this.directorateService.createDirectorate(newDirectorate);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.newDirectorate = ''; // Giriş alanını temizleme
      await this.showDirectorates(); // Yeni kaza türünü yükleme
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
