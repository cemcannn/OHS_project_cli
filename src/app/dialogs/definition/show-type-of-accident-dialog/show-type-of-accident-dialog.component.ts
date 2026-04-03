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

interface TypeOfAccidentVm extends List_Type_Of_Accident {
  code?: string;
  parentCode?: string;
  hierarchyLevel: number;
  plainDescription: string;
}

@Component({
  selector: 'app-show-type-of-accident-dialog',
  templateUrl: './show-type-of-accident-dialog.component.html',
  styleUrls: ['./show-type-of-accident-dialog.component.scss']
})
export class ShowTypeOfAccidentDialogComponent extends BaseDialog<ShowTypeOfAccidentDialogComponent> implements OnInit {
  private readonly codePrefix = '__code__:';
  private readonly parentCodePrefix = '__parent_code__:';

  displayedColumns: string[] = ['code', 'name', 'description', 'actions'];
  dataSource: MatTableDataSource<TypeOfAccidentVm> = new MatTableDataSource<TypeOfAccidentVm>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  editIndex: number | null = null;
  newTypeOfAccidentCode: string = '';
  newTypeOfAccident: string = '';
  newTypeOfAccidentDescription: string = '';
  newTypeOfAccidentParentCode: string = '';
  newTypeOfAccidentIsTopGroup: boolean = true;
  allTypeOfAccidents: TypeOfAccidentVm[] = [];
  private expandedGroupIds = new Set<string>();

  constructor(
    dialogRef: MatDialogRef<ShowTypeOfAccidentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private typeOfAccidentService: TypeOfAccidentService,
    private alertifyService: AlertifyService
  ) {
    super(dialogRef);
  }

  async ngOnInit(): Promise<void> {
    if (this.data?.isPicker) {
      // Keep picker mode compact so critical columns stay visible on narrow screens.
      this.displayedColumns = ['code', 'name', 'actions'];
    }

    await this.showTypeOfAccidents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async showTypeOfAccidents(): Promise<void> {
    try {
      const allTypeOfAccidents = await this.typeOfAccidentService.getTypeOfAccidents();
      this.allTypeOfAccidents = allTypeOfAccidents.datas.map(item => this.toVm(item));
      this.refreshHierarchyView();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.alertifyService.message('Kaza türü bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  selectTypeOfAccident(accident: TypeOfAccidentVm): void {
    if (this.data.isPicker) this.dialogRef.close(accident);
  }

  startEdit(index: number): void { this.editIndex = index; }

  async saveEdit(element: TypeOfAccidentVm): Promise<void> {
    const cleanCode = (element.code ?? '').trim();
    const cleanName = (element.name ?? '').trim();

    if (!cleanCode || !cleanName) {
      this.alertifyService.message('Kaza türü kodu ve adı zorunludur.', {
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

    const updatedTypeOfAccident: Update_Type_Of_Accident = {
      id: element.id,
      name: element.name,
      description: this.encodeDescription(element.code, element.parentCode, element.plainDescription)
    };
    try {
      await this.typeOfAccidentService.updateTypeOfAccident(updatedTypeOfAccident);
      this.alertifyService.message('Kaza türü başarıyla güncellendi.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.editIndex = null;
      await this.showTypeOfAccidents();
    } catch (error) {
      this.alertifyService.message('Kaza türü güncellenirken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  cancelEdit(): void { this.editIndex = null; }

  async createTypeOfAccident(): Promise<void> {
    const cleanCode = this.newTypeOfAccidentCode.trim();
    const cleanName = this.newTypeOfAccident.trim();

    if (!cleanCode || !cleanName) {
      this.alertifyService.message('Kaza türü kodu ve adı zorunludur.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasCodeConflict(this.newTypeOfAccidentCode)) {
      this.alertifyService.message('Bu kod başka bir kayıt ile eşleşiyor. Lütfen farklı bir kod girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    if (this.hasNameConflict(this.newTypeOfAccident)) {
      this.alertifyService.message('Bu isim başka bir kayıt ile eşleşiyor. Lütfen farklı bir isim girin.', {
        dismissOthers: true, messageType: MessageType.Warning, position: Position.TopRight
      });
      return;
    }

    const selectedParentCode = this.newTypeOfAccidentIsTopGroup ? '' : this.newTypeOfAccidentParentCode;

    if (!this.newTypeOfAccidentIsTopGroup && !selectedParentCode) {
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

    const newTypeOfAccident: Create_Type_Of_Accident = {
      name: this.newTypeOfAccident,
      description: this.encodeDescription(
        this.newTypeOfAccidentCode,
        selectedParentCode,
        this.newTypeOfAccidentDescription
      )
    };
    try {
      await this.typeOfAccidentService.createTypeOfAccident(newTypeOfAccident);
      this.alertifyService.message('Kaza türü başarıyla oluşturuldu.', {
        dismissOthers: true, messageType: MessageType.Success, position: Position.TopRight
      });
      this.newTypeOfAccidentCode = '';
      this.newTypeOfAccident = '';
      this.newTypeOfAccidentDescription = '';
      this.newTypeOfAccidentParentCode = '';
      this.newTypeOfAccidentIsTopGroup = true;
      await this.showTypeOfAccidents();
    } catch (error) {
      this.alertifyService.message('Kaza türü oluşturulurken bir hata oluştu.', {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  toggleHierarchyRow(element: TypeOfAccidentVm): void {
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

  isExpanded(element: TypeOfAccidentVm): boolean {
    return this.expandedGroupIds.has(element.id);
  }

  hasChildren(element: TypeOfAccidentVm): boolean {
    const cleanCode = (element.code ?? '').trim().toLowerCase();
    if (!cleanCode) {
      return false;
    }

    return this.allTypeOfAccidents.some(item =>
      item.id !== element.id &&
      (item.parentCode ?? '').trim().toLowerCase() === cleanCode
    );
  }

  private toVm(item: List_Type_Of_Accident): TypeOfAccidentVm {
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

  getParentOptions(currentId?: string): TypeOfAccidentVm[] {
    return this.allTypeOfAccidents
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

    const parent = this.allTypeOfAccidents.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
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

    return this.allTypeOfAccidents.some(item =>
      item.id !== currentId &&
      (item.code ?? '').trim().toLowerCase() === cleanCode
    );
  }

  private hasNameConflict(name: string | undefined, currentId?: string): boolean {
    const cleanName = (name ?? '').trim().toLowerCase();
    if (!cleanName) {
      return false;
    }

    return this.allTypeOfAccidents.some(item =>
      item.id !== currentId &&
      (item.name ?? '').trim().toLowerCase() === cleanName
    );
  }

  private isParentSelectionValid(parentCode: string | undefined, currentId?: string): boolean {
    const cleanParentCode = (parentCode ?? '').trim().toLowerCase();
    if (!cleanParentCode) {
      return true;
    }

    const parent = this.allTypeOfAccidents.find(item => (item.code ?? '').trim().toLowerCase() === cleanParentCode);
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

    const codeToItem = new Map<string, TypeOfAccidentVm>(
      this.allTypeOfAccidents
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

  private isDescendantOf(candidate: TypeOfAccidentVm, ancestorId: string): boolean {
    const codeToItem = new Map<string, TypeOfAccidentVm>(
      this.allTypeOfAccidents
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

  private buildHierarchyList(items: TypeOfAccidentVm[]): TypeOfAccidentVm[] {
    const codeToItem = new Map<string, TypeOfAccidentVm>();
    for (const item of items) {
      const cleanCode = (item.code ?? '').trim().toLowerCase();
      if (cleanCode) {
        codeToItem.set(cleanCode, item);
      }
    }

    const childrenMap = new Map<string, TypeOfAccidentVm[]>();
    const roots: TypeOfAccidentVm[] = [];

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

    const sortByCodeThenName = (a: TypeOfAccidentVm, b: TypeOfAccidentVm) => {
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

    const ordered: TypeOfAccidentVm[] = [];
    const visited = new Set<string>();

    const walk = (item: TypeOfAccidentVm, level: number) => {
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
    this.dataSource.data = this.buildHierarchyList(this.allTypeOfAccidents);
  }

  private collapseDescendants(root: TypeOfAccidentVm): void {
    const cleanRootCode = (root.code ?? '').trim().toLowerCase();
    if (!cleanRootCode) {
      return;
    }

    const childCodes = new Set<string>();
    const collect = (parentCode: string): void => {
      for (const item of this.allTypeOfAccidents) {
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
