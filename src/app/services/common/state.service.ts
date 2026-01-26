import { Injectable, signal, computed, effect } from '@angular/core';

export interface AppState {
  user: User | null;
  accidents: Accident[];
  isOnline: boolean;
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface Accident {
  id: string;
  personnelId: string;
  accidentDate: Date;
  description: string;
}

/**
 * Angular Signals kullanarak reaktif state yönetimi
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Signals - Reaktif state
  private user = signal<User | null>(null);
  private accidents = signal<Accident[]>([]);
  private isOnline = signal<boolean>(navigator.onLine);
  private theme = signal<'light' | 'dark'>('light');

  // Computed signals - Türetilmiş state
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly userRoles = computed(() => this.user()?.roles || []);
  readonly isAdmin = computed(() => this.userRoles().includes('Admin'));
  readonly accidentCount = computed(() => this.accidents().length);

  // Public readonly signals
  readonly currentUser = this.user.asReadonly();
  readonly allAccidents = this.accidents.asReadonly();
  readonly onlineStatus = this.isOnline.asReadonly();
  readonly currentTheme = this.theme.asReadonly();

  constructor() {
    // Effect - Side effects
    effect(() => {
      const theme = this.theme();
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${theme}-theme`);
      localStorage.setItem('theme', theme);
    });

    effect(() => {
      const user = this.user();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    });

    // Online/offline listener
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      this.theme.set(savedTheme);
    }
  }

  // Mutations
  setUser(user: User | null): void {
    this.user.set(user);
  }

  updateUser(updates: Partial<User>): void {
    const current = this.user();
    if (current) {
      this.user.set({ ...current, ...updates });
    }
  }

  setAccidents(accidents: Accident[]): void {
    this.accidents.set(accidents);
  }

  addAccident(accident: Accident): void {
    this.accidents.update(current => [...current, accident]);
  }

  updateAccident(id: string, updates: Partial<Accident>): void {
    this.accidents.update(current =>
      current.map(acc => acc.id === id ? { ...acc, ...updates } : acc)
    );
  }

  removeAccident(id: string): void {
    this.accidents.update(current => current.filter(acc => acc.id !== id));
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
  }

  logout(): void {
    this.user.set(null);
    this.accidents.set([]);
  }
}
