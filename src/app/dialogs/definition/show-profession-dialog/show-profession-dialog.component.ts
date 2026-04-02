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

interface ProfessionVm extends List_Profession {
  code?: string;
  plainDescription: string;
}

@Component({
  selector: 'app-show-profession-dialog',
  templateUrl: './show-profession-dialog.component.html',
  styleUrls: ['./show-profession-dialog.component.scss']
})
export class ShowProfessionDialogComponent extends BaseDialog<ShowProfessionDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';

  displayedColumns: string[] = ['code', 'name', 'description', 'workType', 'actions'];
  dataSource: MatTableDataSource<ProfessionVm> = new MatTableDataSource<ProfessionVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newProfessionCode: string = '';
  newProfession: string = '';
  newProfessionDescription: string = '';
  newProfessionWorkType: string = 'Yeraltı';

  activeTab: 'all' | 'Yeraltı' | 'Yerüstü' = 'all';
  allProfessions: ProfessionVm[] = [];

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
      this.allProfessions = result.datas.map(item => this.toVm(item));
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

  selectProfession(profession: ProfessionVm): void {
    if (this.data.isPicker) this.dialogRef.close(profession);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: ProfessionVm): Promise<void> {
    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const updatedProfession: Update_Profession = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.plainDescription),
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
    if (this.hasCodeConflict(this.newProfessionCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newProfession: Create_Profession = {
      name: this.newProfession,
      description: this.encodeDescription(this.newProfessionCode, this.newProfessionDescription),
      workType: this.newProfessionWorkType
    };
    try {
      await this.professionService.createProfession(newProfession);
      this.alertifyService.message('Meslek başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newProfessionCode = '';
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

  private toVm(item: List_Profession): ProfessionVm {
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

    return this.allProfessions.some(item =>
      item.id !== currentId &&
      (item.code ?? '').trim().toLowerCase() === cleanCode
    );
  }
}
