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
  displayedColumns: string[] = ['profession', 'workType', 'actions'];
  dataSource: MatTableDataSource<List_Profession> = new MatTableDataSource<List_Profession>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newProfession: string = '';
  newProfessionDescription: string = '';
  newProfessionWorkType: string = 'Yeraltı';

  activeTab: 'all' | 'Yeraltı' | 'Yerüstü' = 'all';
  allProfessions: List_Profession[] = [];

  constructor(
    dialogRef: MatDialogRef<ShowProfessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private professionService: ProfessionService,
    private alertifyService: AlertifyService,
  ) {
    super(dialogRef);
  }

  async ngOnInit() { await this.showProfessions(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showProfessions(): Promise<void> {
    try {
      const result = await this.professionService.getProfessions();
      this.allProfessions = result.datas;
      this.applyTab(this.activeTab);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Meslek bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  setTab(tab: 'all' | 'Yeraltı' | 'Yerüstü') {
    this.activeTab = tab;
    this.editIndex = null;
    this.applyTab(tab);
  }

  private applyTab(tab: 'all' | 'Yeraltı' | 'Yerüstü') {
    this.dataSource.data = tab === 'all'
      ? this.allProfessions
      : this.allProfessions.filter(p => p.workType === tab);
  }

  selectProfession(profession: List_Profession): void {
    if (this.data.isPicker) this.dialogRef.close(profession);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: List_Profession): Promise<void> {
    const updatedProfession: Update_Profession = {
      id: element.id,
      name: element.name,
      description: element.description,
      workType: element.workType
    };
    try {
      await this.professionService.updateProfession(updatedProfession);
      this.alertifyService.message('Meslek başarıyla güncellendi.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.editIndex = null;
      await this.showProfessions();
    } catch (error) {
      this.alertifyService.message('Meslek güncellenirken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  cancelEdit(): void { this.editIndex = null; }

  async createProfession(): Promise<void> {
    const newProfession: Create_Profession = {
      name: this.newProfession,
      description: this.newProfessionDescription,
      workType: this.newProfessionWorkType
    };
    try {
      await this.professionService.createProfession(newProfession);
      this.alertifyService.message('Meslek başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newProfession = '';
      this.newProfessionDescription = '';
      await this.showProfessions();
    } catch (error) {
      this.alertifyService.message('Meslek oluşturulurken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  get undergroundCount() { return this.allProfessions.filter(p => p.workType === 'Yeraltı').length; }
  get surfaceCount() { return this.allProfessions.filter(p => p.workType === 'Yerüstü').length; }
}
