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

interface AccidentAreaVm extends List_Accident_Area {
  code?: string;
  workType?: 'Yeraltı' | 'Yerüstü';
  parentCode?: string;
  hierarchyLevel: number;
  plainDescription: string;
}

@Component({
  selector: 'app-show-accident-area-dialog',
  templateUrl: './show-accident-area-dialog.component.html',
  styleUrls: ['./show-accident-area-dialog.component.scss']
})
export class ShowAccidentAreaDialogComponent extends BaseDialog<ShowAccidentAreaDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';
  private readonly workTypePrefix = '__worktype__:';
  private readonly parentCodePrefix = '__parent_code__:';

  displayedColumns: string[] = ['code', 'name', 'parentGroup', 'description', 'workType', 'actions'];
  dataSource: MatTableDataSource<AccidentAreaVm> = new MatTableDataSource<AccidentAreaVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newAccidentAreaCode: string = '';
  newAccidentArea: string = '';
  newAccidentAreaDescription: string = '';
  newAccidentAreaWorkType: 'Yeraltı' | 'Yerüstü' = 'Yeraltı';
  newAccidentAreaParentCode: string = '';
  newAccidentAreaIsTopGroup: boolean = true;

  activeTab: 'all' | 'Yeraltı' | 'Yerüstü' = 'all';
  allAccidentAreas: AccidentAreaVm[] = [];
  private expandedGroupIds = new Set<string>();

  constructor(
    dialogRef: MatDialogRef<ShowAccidentAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentAreaService: AccidentAreaService,
    private alertifyService: AlertifyService
  ) {
    super(dialogRef);
  }

  async ngOnInit(): Promise<void> { await this.showAccidentAreas(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showAccidentAreas(): Promise<void> {
    try {
      const allAccidentAreas = await this.accidentAreaService.getAccidentAreas();
      this.allAccidentAreas = allAccidentAreas.datas.map(item => this.toVm(item));
      this.applyTab(this.activeTab);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Kaza yeri bilgilerini yüklerken bir hata oluştu.', {
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
      ? this.allAccidentAreas
      : this.allAccidentAreas.filter(p => p.workType === tab);

    this.dataSource.data = this.buildHierarchyList(filtered);
  }

  toggleHierarchyRow(element: AccidentAreaVm): void {
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

  isExpanded(element: AccidentAreaVm): boolean {
    return this.expandedGroupIds.has(element.id);
  }

  hasChildren(element: AccidentAreaVm): boolean {
    const cleanCode = (element.code ?? '').trim().toLowerCase();
    if (!cleanCode) {
      return false;
    }

    return this.allAccidentAreas.some(item =>
      item.id !== element.id &&
      (item.parentCode ?? '').trim().toLowerCase() === cleanCode
    );
  }

  selectAccidentArea(accident: AccidentAreaVm): void {
    if (this.data.isPicker) this.dialogRef.close(accident);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: AccidentAreaVm): Promise<void> {
    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
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

    const updatedAccidentArea: Update_Accident_Area = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.workType, element.parentCode, element.plainDescription)
    };
    try {
      await this.accidentAreaService.updateAccidentArea(updatedAccidentArea);
      this.alertifyService.message('Kaza yeri başarıyla güncellendi.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.editIndex = null;
      await this.showAccidentAreas();
    } catch (error) {
      this.alertifyService.message('Kaza yeri güncellenirken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  cancelEdit(): void { this.editIndex = null; }

  async createAccidentArea(): Promise<void> {
    if (this.hasCodeConflict(this.newAccidentAreaCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const selectedParentCode = this.newAccidentAreaIsTopGroup ? '' : this.newAccidentAreaParentCode;

    if (!this.newAccidentAreaIsTopGroup && !selectedParentCode) {
      this.alertifyService.message('Alt grup seçtiğiniz için bağlı olduğu üst grubu seçmelisiniz.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (!this.isParentSelectionValid(selectedParentCode, this.newAccidentAreaWorkType)) {
      this.alertifyService.message('Seçilen üst grup geçersiz. Aynı çalışma alanında bir üst grup seçin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newAccidentArea: Create_Accident_Area = {
      name: this.newAccidentArea,
      description: this.encodeDescription(
        this.newAccidentAreaCode,
        this.newAccidentAreaWorkType,
        selectedParentCode,
        this.newAccidentAreaDescription
      )
    };
    try {
      await this.accidentAreaService.createAccidentArea(newAccidentArea);
      this.alertifyService.message('Kaza yeri başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newAccidentAreaCode = '';
      this.newAccidentArea = '';
      this.newAccidentAreaDescription = '';
      this.newAccidentAreaWorkType = 'Yeraltı';
      this.newAccidentAreaParentCode = '';
      this.newAccidentAreaIsTopGroup = true;
      await this.showAccidentAreas();
    } catch (error) {
      this.alertifyService.message('Kaza yeri oluşturulurken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  get undergroundCount() { return this.allAccidentAreas.filter(p => p.workType === 'Yeraltı').length; }
  get surfaceCount() { return this.allAccidentAreas.filter(p => p.workType === 'Yerüstü').length; }

  private toVm(item: List_Accident_Area): AccidentAreaVm {
    const decoded = this.decodeDescription(item.description);
    return {
      ...item,
      code: decoded.code,
      workType: decoded.workType,
      parentCode: decoded.parentCode,
      hierarchyLevel: 0,
      plainDescription: decoded.description,
      description: item.description
    };
  }

  getParentOptions(workType: 'Yeraltı' | 'Yerüstü' | undefined, currentId?: string): AccidentAreaVm[] {
    return this.allAccidentAreas
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

    const parent = this.allAccidentAreas.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
    return parent ? `${parent.code} - ${parent.name}` : parentCode ?? '-';
  }

  private encodeDescription(
    code: string | undefined,
    workType: 'Yeraltı' | 'Yerüstü' | undefined,
    parentCode: string | undefined,
    description: string | undefined
  ): string {
    const cleanCode = (code ?? '').trim();
    const cleanParentCode = (parentCode ?? '').trim();
    const cleanDescription = description ?? '';
    const metadataLines: string[] = [];

    if (cleanCode) {
      metadataLines.push(`${this.codePrefix}${cleanCode}`);
    }

    if (workType) {
      metadataLines.push(`${this.workTypePrefix}${workType}`);
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

  private decodeDescription(raw: string | undefined): {
    code?: string;
    workType?: 'Yeraltı' | 'Yerüstü';
    parentCode?: string;
    description: string
  } {
    const value = raw ?? '';
    const lines = value.split('\n');
    let lineIndex = 0;
    let code: string | undefined;
    let workType: 'Yeraltı' | 'Yerüstü' | undefined;
    let parentCode: string | undefined;

    while (lineIndex < lines.length) {
      const currentLine = lines[lineIndex];
      if (currentLine.startsWith(this.codePrefix)) {
        code = currentLine.substring(this.codePrefix.length).trim();
        lineIndex++;
        continue;
      }
      if (currentLine.startsWith(this.workTypePrefix)) {
        workType = this.normalizeWorkType(currentLine.substring(this.workTypePrefix.length).trim());
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
    return { code, workType, parentCode, description };
  }

  private hasCodeConflict(code: string | undefined, currentId?: string): boolean {
    const cleanCode = (code ?? '').trim().toLowerCase();
    if (!cleanCode) {
      return false;
    }

    return this.allAccidentAreas.some(item =>
      item.id !== currentId &&
      (item.code ?? '').trim().toLowerCase() === cleanCode
    );
  }

  private normalizeWorkType(raw: string): 'Yeraltı' | 'Yerüstü' | undefined {
    return raw === 'Yeraltı' || raw === 'Yerüstü' ? raw : undefined;
  }

  private isParentSelectionValid(parentCode: string | undefined, workType: 'Yeraltı' | 'Yerüstü' | undefined, currentId?: string): boolean {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return true;
    }

    const parent = this.allAccidentAreas.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
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

    const idToItem = new Map<string, AccidentAreaVm>(this.allAccidentAreas.map(item => [item.id, item]));
    const codeToItem = new Map<string, AccidentAreaVm>(
      this.allAccidentAreas
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

      const byCode = codeToItem.get(nextParentCode);
      if (byCode) {
        cursor = byCode;
        continue;
      }

      const byId = idToItem.get(nextParentCode);
      cursor = byId;
    }

    return false;
  }

  private isDescendantOf(candidate: AccidentAreaVm, ancestorId: string): boolean {
    const codeToItem = new Map<string, AccidentAreaVm>(
      this.allAccidentAreas
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

  private buildHierarchyList(items: AccidentAreaVm[]): AccidentAreaVm[] {
    const codeToItem = new Map<string, AccidentAreaVm>();
    for (const item of items) {
      const cleanCode = (item.code ?? '').trim().toLowerCase();
      if (cleanCode) {
        codeToItem.set(cleanCode, item);
      }
    }

    const childrenMap = new Map<string, AccidentAreaVm[]>();
    const roots: AccidentAreaVm[] = [];

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

    const sortByCodeThenName = (a: AccidentAreaVm, b: AccidentAreaVm) => {
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

    const ordered: AccidentAreaVm[] = [];
    const visited = new Set<string>();

    const walk = (item: AccidentAreaVm, level: number) => {
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

  private collapseDescendants(root: AccidentAreaVm): void {
    const cleanRootCode = (root.code ?? '').trim().toLowerCase();
    if (!cleanRootCode) {
      return;
    }

    const childCodes = new Set<string>();
    const collect = (parentCode: string): void => {
      for (const item of this.allAccidentAreas) {
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
