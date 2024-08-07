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

@Component({
  selector: 'app-show-type-of-accident-dialog',
  templateUrl: './show-type-of-accident-dialog.component.html',
  styleUrls: ['./show-type-of-accident-dialog.component.scss']
})
export class ShowTypeOfAccidentDialogComponent extends BaseDialog<ShowTypeOfAccidentDialogComponent> implements OnInit {
  displayedColumns: string[] = ['typeOfAccident', 'actions'];
  dataSource: MatTableDataSource<List_Type_Of_Accident> = new MatTableDataSource<List_Type_Of_Accident>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null; // Düzenleme modunda olan satırın indeksi
  newTypeOfAccident: string = ''; // Yeni kaza türü eklemek için

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
      this.dataSource.data = allTypeOfAccidents.datas;
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

  selectTypeOfAccident(accident: List_Type_Of_Accident): void {
    if (this.data.isPicker) {
      this.dialogRef.close(accident);
    }
  }

  startEdit(index: number): void {
    this.editIndex = index;
  }

  async saveEdit(element: List_Type_Of_Accident): Promise<void> {
    const updatedTypeOfAccident: Update_Type_Of_Accident = {
      id: element.id,
      name: element.name // Güncellenen kaza türü adı
    };

    try {
      await this.typeOfAccidentService.updateTypeOfAccident(updatedTypeOfAccident);
      this.alertifyService.message('Kaza türü başarıyla güncellendi.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.editIndex = null; // Düzenleme modunu kapat
      await this.showTypeOfAccidents(); // Güncellenen kaza türünü yükleme
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

  async createTypeOfAccident(): Promise<void> {
    const newTypeOfAccident: Create_Type_Of_Accident = {
      name: this.newTypeOfAccident // Yeni kaza türü adı
    };

    try {
      await this.typeOfAccidentService.createTypeOfAccident(newTypeOfAccident);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.newTypeOfAccident = ''; // Giriş alanını temizleme
      await this.showTypeOfAccidents(); // Yeni kaza türünü yükleme
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
