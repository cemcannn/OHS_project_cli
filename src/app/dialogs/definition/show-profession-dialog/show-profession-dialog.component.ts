import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MatTableDataSource } from '@angular/material/table';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Profession } from 'src/app/contracts/definitions/profession/update_profession';
import { Create_Profession } from 'src/app/contracts/definitions/profession/create_profession';
import { ProfessionService } from 'src/app/services/common/models/profession.service';

@Component({
  selector: 'app-show-profession-dialog',
  templateUrl: './show-profession-dialog.component.html',
  styleUrls: ['./show-profession-dialog.component.scss']
})
export class ShowProfessionDialogComponent extends BaseDialog<ShowProfessionDialogComponent> implements OnInit {
  displayedColumns: string[] = ['profession', 'actions'];
  dataSource: MatTableDataSource<List_Profession> = new MatTableDataSource<List_Profession>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null; // Düzenleme modunda olan satırın indeksi
  newProfession: string = ''; // Yeni kaza türü eklemek için

  constructor(
    dialogRef: MatDialogRef<ShowProfessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private professionService: ProfessionService,
    private alertifyService: AlertifyService,
  ) {
    super(dialogRef);
  }

  async ngOnInit(){
    await this.showProfessions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showProfessions(): Promise<void> {
    try {
      const allProfessions = await this.professionService.getProfessions();
      this.dataSource.data = allProfessions.datas;
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

  selectProfession(accident: List_Profession): void {
    if (this.data.isPicker) {
      this.dialogRef.close(accident);
    }
  }

  startEdit(index: number): void {
    this.editIndex = index;
  }

  async saveEdit(element: List_Profession): Promise<void> {
    const updatedProfession: Update_Profession = {
      id: element.id,
      name: element.name // Güncellenen kaza türü adı
    };

    try {
      await this.professionService.updateProfession(updatedProfession);
      this.alertifyService.message('Uzuv türü başarıyla güncellendi.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.editIndex = null; // Düzenleme modunu kapat
      await this.showProfessions(); // Güncellenen kaza türünü yükleme
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

  async createProfession(): Promise<void> {
    const newProfession: Create_Profession = {
      name: this.newProfession // Yeni kaza türü adı
    };

    try {
      await this.professionService.createProfession(newProfession);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
      this.newProfession = ''; // Giriş alanını temizleme
      await this.showProfessions(); // Yeni kaza türünü yükleme
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
