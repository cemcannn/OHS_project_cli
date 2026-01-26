import { Component, ChangeDetectionStrategy } from '@angular/core';
import { StateService } from '../../../services/common/state.service';

/**
 * Dark mode toggle component
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button 
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [attr.aria-label]="'Tema değiştir: ' + (currentTheme() === 'light' ? 'Karanlık' : 'Aydınlık')">
      <i [class]="currentTheme() === 'light' ? 'fas fa-moon' : 'fas fa-sun'"></i>
      <span class="sr-only">{{ currentTheme() === 'light' ? 'Karanlık' : 'Aydınlık' }} Tema</span>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      color: var(--text-color);
      transition: transform 0.2s ease;
    }

    .theme-toggle-btn:hover {
      transform: scale(1.1);
    }

    .theme-toggle-btn:active {
      transform: scale(0.95);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class ThemeToggleComponent {
  currentTheme = this.stateService.currentTheme;

  constructor(private stateService: StateService) {}

  toggleTheme(): void {
    this.stateService.toggleTheme();
  }
}
