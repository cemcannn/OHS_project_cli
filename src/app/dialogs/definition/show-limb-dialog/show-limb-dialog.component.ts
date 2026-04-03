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

interface LimbVm extends List_Limb {
  code?: string;
  parentCode?: string;
  hierarchyLevel: number;
  plainDescription: string;
}

@Component({
  selector: 'app-show-limb-dialog',
  templateUrl: './show-limb-dialog.component.html',
  styleUrls: ['./show-limb-dialog.component.scss']
})
export class ShowLimbDialogComponent extends BaseDialog<ShowLimbDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';
  private readonly parentCodePrefix = '__parent_code__:';

  displayedColumns: string[] = ['code', 'name', 'parentGroup', 'description', 'actions'];
  dataSource: MatTableDataSource<LimbVm> = new MatTableDataSource<LimbVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newLimbCode: string = '';
  newLimb: string = '';
  newLimbDescription: string = '';
  newLimbParentCode: string = '';
  newLimbIsTopGroup: boolean = true;
  allLimbs: LimbVm[] = [];
  private expandedGroupIds = new Set<string>();

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
      this.allLimbs = allLimbs.datas.map(item => this.toVm(item));
      this.refreshHierarchyView();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Uzuv bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  selectLimb(limb: LimbVm): void {
    if (this.data.isPicker) this.dialogRef.close(limb);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: LimbVm): Promise<void> {
    if (this.hasCodeConflict(element.code, element.id)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (!this.isParentSelectionValid(element.parentCode, element.id)) {
      this.alertifyService.message('Seçilen üst grup geçersiz. Farklı bir kayıt seçin.', {
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

    const updatedLimb: Update_Limb = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.parentCode, element.plainDescription)
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
    if (this.hasCodeConflict(this.newLimbCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const selectedParentCode = this.newLimbIsTopGroup ? '' : this.newLimbParentCode;

    if (!this.newLimbIsTopGroup && !selectedParentCode) {
      this.alertifyService.message('Alt grup seçtiğiniz için bağlı olduğu üst grubu seçmelisiniz.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (!this.isParentSelectionValid(selectedParentCode)) {
      this.alertifyService.message('Seçilen üst grup geçersiz. Lütfen listeden bir üst grup seçin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const newLimb: Create_Limb = {
      name: this.newLimb,
      description: this.encodeDescription(this.newLimbCode, selectedParentCode, this.newLimbDescription)
    };
    try {
      await this.limbService.createLimb(newLimb);
      this.alertifyService.message('Uzuv başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newLimbCode = '';
      this.newLimb = '';
      this.newLimbDescription = '';
      this.newLimbParentCode = '';
      this.newLimbIsTopGroup = true;
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

  toggleHierarchyRow(element: LimbVm): void {
    if (!this.hasChildren(element)) {
      return;
    }

    if (this.expandedGroupIds.has(element.id)) {
      this.expandedGroupIds.delete(element.id);
      this.collapseDescendants(element);
    } else {
      this.expandedGroupIds.add(element.id);
    }

    this.refreshHierarchyView();
  }

  isExpanded(element: LimbVm): boolean {
    return this.expandedGroupIds.has(element.id);
  }

  hasChildren(element: LimbVm): boolean {
    const cleanCode = (element.code ?? '').trim().toLowerCase();
    if (!cleanCode) {
      return false;
    }

    return this.allLimbs.some(item =>
      item.id !== element.id &&
      (item.parentCode ?? '').trim().toLowerCase() === cleanCode
    );
  }

  private toVm(item: List_Limb): LimbVm {
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

  getParentOptions(currentId?: string): LimbVm[] {
    return this.allLimbs
      .filter(item => !!item.code)
      .filter(item => !currentId || item.id !== currentId)
      .filter(item => !currentId || !this.isDescendantOf(item, currentId))
      .sort((a, b) => (a.code ?? '').localeCompare(b.code ?? '', 'tr', { numeric: true }));
  }

  getParentLabel(parentCode: string | undefined): string {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return '-';
    }

    const parent = this.allLimbs.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
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

    return this.allLimbs.some(item =>
      item.id !== currentId &&
      (item.code ?? '').trim().toLowerCase() === cleanCode
    );
  }

  private isParentSelectionValid(parentCode: string | undefined, currentId?: string): boolean {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return true;
    }

    const parent = this.allLimbs.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
    if (!parent) {
      return false;
    }

    if (currentId && parent.id === currentId) {
      return false;
    }

    return true;
  }

  private hasParentCycle(currentId: string, parentCode: string | undefined): boolean {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return false;
    }

    const codeToItem = new Map<string, LimbVm>(
      this.allLimbs
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

  private isDescendantOf(candidate: LimbVm, ancestorId: string): boolean {
    const codeToItem = new Map<string, LimbVm>(
      this.allLimbs
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

  private buildHierarchyList(items: LimbVm[]): LimbVm[] {
    const codeToItem = new Map<string, LimbVm>();
    for (const item of items) {
      const cleanCode = (item.code ?? '').trim().toLowerCase();
      if (cleanCode) {
        codeToItem.set(cleanCode, item);
      }
    }

    const childrenMap = new Map<string, LimbVm[]>();
    const roots: LimbVm[] = [];

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

    const sortByCodeThenName = (a: LimbVm, b: LimbVm) => {
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

    const ordered: LimbVm[] = [];
    const visited = new Set<string>();

    const walk = (item: LimbVm, level: number) => {
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

  private refreshHierarchyView(): void {
    this.dataSource.data = this.buildHierarchyList(this.allLimbs);
  }

  private collapseDescendants(root: LimbVm): void {
    const cleanRootCode = (root.code ?? '').trim().toLowerCase();
    if (!cleanRootCode) {
      return;
    }

    const childCodes = new Set<string>();
    const collect = (parentCode: string): void => {
      for (const item of this.allLimbs) {
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
