import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Skeleton (İskelet) loading component
 * İçerik yüklenirken placeholder gösterir
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-wrapper" [attr.aria-busy]="true" [attr.aria-live]="polite">
      <div *ngIf="type === 'text'" class="skeleton skeleton-text" [style.width.%]="width"></div>
      <div *ngIf="type === 'circle'" class="skeleton skeleton-circle" [style.width.px]="size" [style.height.px]="size"></div>
      <div *ngIf="type === 'rectangle'" class="skeleton skeleton-rectangle" [style.width.%]="width" [style.height.px]="height"></div>
      <div *ngIf="type === 'card'" class="skeleton skeleton-card">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
      <div *ngIf="type === 'table'" class="skeleton skeleton-table">
        <div class="skeleton-row" *ngFor="let row of rows">
          <div class="skeleton-cell" *ngFor="let col of columns"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .skeleton-text {
      height: 16px;
      margin: 8px 0;
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    .skeleton-rectangle {
      min-height: 100px;
    }

    .skeleton-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin: 8px 0;
    }

    .skeleton-card-header {
      height: 24px;
      width: 60%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .skeleton-line {
      height: 12px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin: 8px 0;
    }

    .skeleton-line.short {
      width: 40%;
    }

    .skeleton-table {
      width: 100%;
    }

    .skeleton-row {
      display: flex;
      gap: 8px;
      margin: 8px 0;
    }

    .skeleton-cell {
      flex: 1;
      height: 40px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'circle' | 'rectangle' | 'card' | 'table' = 'text';
  @Input() width: number = 100;
  @Input() height: number = 100;
  @Input() size: number = 50;
  @Input() rows: number[] = [1, 2, 3, 4, 5];
  @Input() columns: number[] = [1, 2, 3, 4];
}
