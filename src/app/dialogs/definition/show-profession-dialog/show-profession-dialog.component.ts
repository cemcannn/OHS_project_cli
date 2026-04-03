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
  parentCode?: string;
  hierarchyLevel: number;
  plainDescription: string;
}

@Component({
  selector: 'app-show-profession-dialog',
  templateUrl: './show-profession-dialog.component.html',
  styleUrls: ['./show-profession-dialog.component.scss']
})
export class ShowProfessionDialogComponent extends BaseDialog<ShowProfessionDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';
  private readonly parentCodePrefix = '__parent_code__:';

  displayedColumns: string[] = ['code', 'name', 'description', 'workType', 'actions'];
  dataSource: MatTableDataSource<ProfessionVm> = new MatTableDataSource<ProfessionVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newProfessionCode: string = '';
  newProfession: string = '';
  newProfessionDescription: string = '';
  newProfessionWorkType: string = 'Yeraltı';
  newProfessionParentCode: string = '';
  newProfessionIsTopGroup: boolean = true;
  private expandedGroupIds = new Set<string>();

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
    const filtered = tab === 'all'
      ? this.allProfessions
      : this.allProfessions.filter(p => p.workType === tab);

    this.dataSource.data = this.buildHierarchyList(filtered);
  }

  toggleHierarchyRow(element: ProfessionVm): void {
    if (!this.hasChildren(element)) {
      return;
    }

    if (this.expandedGroupIds.has(element.id)) {
      this.expandedGroupIds.delete(element.id);
      this.collapseDescendants(element);
    } else {
      this.expandedGroupIds.add(element.id);
    }

    this.applyTab(this.activeTab);
  }

  isExpanded(element: ProfessionVm): boolean {
    return this.expandedGroupIds.has(element.id);
  }

  hasChildren(element: ProfessionVm): boolean {
    const cleanCode = (element.code ?? '').trim().toLowerCase();
    if (!cleanCode) {
      return false;
    }

    return this.allProfessions.some(item =>
      item.id !== element.id &&
      (item.parentCode ?? '').trim().toLowerCase() === cleanCode
    );
  }

  selectProfession(profession: ProfessionVm): void {
    if (this.data.isPicker) this.dialogRef.close(profession);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: ProfessionVm): Promise<void> {
    const cleanCode = (element.code ?? '').trim();
    const cleanName = (element.name ?? '').trim();

    if (!cleanCode || !cleanName) {
      this.alertifyService.message('Meslek kodu ve adı zorunludur.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasNameConflict(element.name, element.id)) {
      this.alertifyService.message('Bu isim başka bir kayıt ile eşleşiyor. Lütfen farklı bir isim girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (!this.isParentSelectionValid(element.parentCode, element.workType, element.id)) {
      this.alertifyService.message('Seçilen üst grup geçersiz. Aynı çalışma alanında ve farklı bir kayıt seçin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasParentCycle(element.id, element.parentCode)) {
      this.alertifyService.message('Hiyerarşi döngüsü oluşuyor. Üst grup seçimini kontrol edin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const updatedProfession: Update_Profession = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.parentCode, element.plainDescription),
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
    const cleanCode = this.newProfessionCode.trim();
    const cleanName = this.newProfession.trim();

    if (!cleanCode || !cleanName) {
      this.alertifyService.message('Meslek kodu ve adı zorunludur.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasCodeConflict(this.newProfessionCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasNameConflict(this.newProfession)) {
      this.alertifyService.message('Bu isim başka bir kayıt ile eşleşiyor. Lütfen farklı bir isim girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const selectedParentCode = this.newProfessionIsTopGroup ? '' : this.newProfessionParentCode;

    if (!this.newProfessionIsTopGroup && !selectedParentCode) {
      this.alertifyService.message('Alt grup seçtiğiniz için bağlı olduğu üst grubu seçmelisiniz.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (!this.isParentSelectionValid(selectedParentCode, this.newProfessionWorkType as 'Yeraltı' | 'Yerüstü')) {
      this.alertifyService.message('Seçilen üst grup geçersiz. Aynı çalışma alanında bir üst grup seçin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newProfession: Create_Profession = {
      name: this.newProfession,
      description: this.encodeDescription(this.newProfessionCode, selectedParentCode, this.newProfessionDescription),
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
      this.newProfessionParentCode = '';
      this.newProfessionIsTopGroup = true;
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
      parentCode: decoded.parentCode,
      hierarchyLevel: 0,
      plainDescription: decoded.description,
      description: item.description
    };
  }

  getParentOptions(workType: string | undefined, currentId?: string): ProfessionVm[] {
    return this.allProfessions
      .filter(item => !!item.code)
      .filter(item => !workType || item.workType === workType)
      .filter(item => !currentId || item.id !== currentId)
      .filter(item => !currentId || !this.isDescendantOf(item, currentId))
      .sort((a, b) => (a.code ?? '').localeCompare(b.code ?? '', 'tr', { numeric: true }));
  }

  getParentLabel(parentCode: string | undefined): string {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return '-';
    }

    const parent = this.allProfessions.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
    return parent ? `${parent.code} - ${parent.name}` : parentCode ?? '-';
  }

  private encodeDescription(code: string | undefined, parentCode: string | undefined, description: string | undefined): string {
    const cleanCode = (code ?? '').trim();
    const cleanParentCode = (parentCode ?? '').trim();
    const cleanDescription = description ?? '';
    const metadataLines: string[] = [];

    if (cleanCode) {
      metadataLines.push(`${this.codePrefix}${cleanCode}`);
    }

    if (cleanParentCode) {
      metadataLines.push(`${this.parentCodePrefix}${cleanParentCode}`);
    }

    if (metadataLines.length === 0) {
      return cleanDescription;
    }

    if (!cleanDescription) {
      return metadataLines.join('\n');
    }

    return `${metadataLines.join('\n')}\n${cleanDescription}`;
  }

  private decodeDescription(raw: string | undefined): { code?: string; parentCode?: string; description: string } {
    const value = raw ?? '';
    const lines = value.split('\n');
    let lineIndex = 0;
    let code: string | undefined;
    let parentCode: string | undefined;

    while (lineIndex < lines.length) {
      const currentLine = lines[lineIndex];
      if (currentLine.startsWith(this.codePrefix)) {
        code = currentLine.substring(this.codePrefix.length).trim();
        lineIndex++;
        continue;
      }
      if (currentLine.startsWith(this.parentCodePrefix)) {
        const decodedParent = currentLine.substring(this.parentCodePrefix.length).trim();
        parentCode = decodedParent || undefined;
        lineIndex++;
        continue;
      }
      break;
    }

    const description = lines.slice(lineIndex).join('\n');
    return { code, parentCode, description };
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

  private hasNameConflict(name: string | undefined, currentId?: string): boolean {
    const cleanName = (name ?? '').trim().toLowerCase();
    if (!cleanName) {
      return false;
    }

    return this.allProfessions.some(item =>
      item.id !== currentId &&
      (item.name ?? '').trim().toLowerCase() === cleanName
    );
  }

  private isParentSelectionValid(parentCode: string | undefined, workType: string | undefined, currentId?: string): boolean {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return true;
    }

    const parent = this.allProfessions.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
    if (!parent) {
      return false;
    }

    if (currentId && parent.id === currentId) {
      return false;
    }

    if (workType && parent.workType && parent.workType !== workType) {
      return false;
    }

    return true;
  }

  private hasParentCycle(currentId: string, parentCode: string | undefined): boolean {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return false;
    }

    const codeToItem = new Map<string, ProfessionVm>(
      this.allProfessions
        .filter(item => !!item.code)
        .map(item => [(item.code ?? '').trim().toLowerCase(), item])
    );

    let cursor = codeToItem.get(cleanParentCode);
    const visited = new Set<string>();

    while (cursor) {
      if (cursor.id === currentId) {
        return true;
      }

      if (visited.has(cursor.id)) {
        return true;
      }
      visited.add(cursor.id);

      const nextParentCode = (cursor.parentCode ?? '').trim().toLowerCase();
      if (!nextParentCode) {
        break;
      }

      cursor = codeToItem.get(nextParentCode);
    }

    return false;
  }

  private isDescendantOf(candidate: ProfessionVm, ancestorId: string): boolean {
    const codeToItem = new Map<string, ProfessionVm>(
      this.allProfessions
        .filter(item => !!item.code)
        .map(item => [(item.code ?? '').trim().toLowerCase(), item])
    );

    let parentCode = (candidate.parentCode ?? '').trim().toLowerCase();
    const visited = new Set<string>();

    while (parentCode) {
      const parent = codeToItem.get(parentCode);
      if (!parent) {
        return false;
      }

      if (parent.id === ancestorId) {
        return true;
      }

      if (visited.has(parent.id)) {
        return false;
      }
      visited.add(parent.id);
      parentCode = (parent.parentCode ?? '').trim().toLowerCase();
    }

    return false;
  }

  private buildHierarchyList(items: ProfessionVm[]): ProfessionVm[] {
    const codeToItem = new Map<string, ProfessionVm>();
    for (const item of items) {
      const cleanCode = (item.code ?? '').trim().toLowerCase();
      if (cleanCode) {
        codeToItem.set(cleanCode, item);
      }
    }

    const childrenMap = new Map<string, ProfessionVm[]>();
    const roots: ProfessionVm[] = [];

    for (const item of items) {
      const parentCode = (item.parentCode ?? '').trim().toLowerCase();
      const parent = parentCode ? codeToItem.get(parentCode) : undefined;

      if (!parent || parent.id === item.id) {
        roots.push(item);
        continue;
      }

      const key = parent.id;
      if (!childrenMap.has(key)) {
        childrenMap.set(key, []);
      }
      childrenMap.get(key)?.push(item);
    }

    const sortByCodeThenName = (a: ProfessionVm, b: ProfessionVm) => {
      const codeCompare = (a.code ?? '').localeCompare(b.code ?? '', 'tr', { numeric: true });
      if (codeCompare !== 0) {
        return codeCompare;
      }
      return (a.name ?? '').localeCompare(b.name ?? '', 'tr');
    };

    roots.sort(sortByCodeThenName);
    for (const list of childrenMap.values()) {
      list.sort(sortByCodeThenName);
    }

    const ordered: ProfessionVm[] = [];
    const visited = new Set<string>();

    const walk = (item: ProfessionVm, level: number) => {
      if (visited.has(item.id)) {
        return;
      }
      visited.add(item.id);
      item.hierarchyLevel = level;
      ordered.push(item);

      if (this.expandedGroupIds.has(item.id)) {
        const children = childrenMap.get(item.id) ?? [];
        for (const child of children) {
          walk(child, level + 1);
        }
      }
    };

    for (const root of roots) {
      walk(root, 0);
    }

    return ordered;
  }

  private collapseDescendants(root: ProfessionVm): void {
    const cleanRootCode = (root.code ?? '').trim().toLowerCase();
    if (!cleanRootCode) {
      return;
    }

    const childCodes = new Set<string>();
    const collect = (parentCode: string): void => {
      for (const item of this.allProfessions) {
        if ((item.parentCode ?? '').trim().toLowerCase() === parentCode) {
          const childCode = (item.code ?? '').trim().toLowerCase();
          if (childCode && !childCodes.has(childCode)) {
            childCodes.add(childCode);
            this.expandedGroupIds.delete(item.id);
            collect(childCode);
          }
        }
      }
    };

    collect(cleanRootCode);
  }
}
