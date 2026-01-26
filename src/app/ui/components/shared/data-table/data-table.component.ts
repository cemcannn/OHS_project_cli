import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Performans için OnPush change detection stratejisi kullanan
 * tekrar kullanılabilir tablo komponenti
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th *ngFor="let column of columns">{{ column.label }}</th>
            <th *ngIf="actions.length > 0">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of data; trackBy: trackByFn">
            <td *ngFor="let column of columns">
              {{ getNestedProperty(item, column.property) }}
            </td>
            <td *ngIf="actions.length > 0">
              <button
                *ngFor="let action of actions"
                [class]="action.class || 'btn btn-sm btn-primary'"
                (click)="action.handler(item)"
                [disabled]="action.disabled?.(item)">
                <i [class]="action.icon"></i>
                {{ action.label }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div *ngIf="!data || data.length === 0" class="text-center p-4">
        <p>Veri bulunamadı</p>
      </div>
    </div>
  `,
  styles: [`
    .table-responsive {
      overflow-x: auto;
    }
    button + button {
      margin-left: 0.5rem;
    }
  `]
})
export class DataTableComponent<T> {
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() trackByProperty: string = 'id';

  trackByFn = (index: number, item: any): any => {
    return item[this.trackByProperty] ?? index;
  };

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }
}

export interface TableColumn {
  property: string;
  label: string;
  sortable?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  class?: string;
  handler: (item: T) => void;
  disabled?: (item: T) => boolean;
}
