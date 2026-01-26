import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';

export interface LoadingState {
  [key: string]: boolean;
}

/**
 * Merkezi loading state yönetimi
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({});
  public loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  /**
   * Belirli bir key için loading state'i true yapar
   */
  show(key: string = 'global'): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({ ...currentState, [key]: true });
  }

  /**
   * Belirli bir key için loading state'i false yapar
   */
  hide(key: string = 'global'): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({ ...currentState, [key]: false });
  }

  /**
   * Belirli bir key'in loading state'ini döner
   */
  isLoading(key: string = 'global'): Observable<boolean> {
    return new Observable(observer => {
      this.loading$.subscribe(state => {
        observer.next(state[key] || false);
      });
    });
  }

  /**
   * Observable'ı loading state ile wrap eder
   */
  wrapObservable<T>(observable: Observable<T>, key: string = 'global'): Observable<T> {
    this.show(key);
    return observable.pipe(
      finalize(() => this.hide(key))
    );
  }
}
