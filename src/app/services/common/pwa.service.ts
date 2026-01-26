import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';

/**
 * Service Worker güncellemelerini yöneten servis
 */
@Injectable({
  providedIn: 'root'
})
export class PwaService {
  constructor(private swUpdate: SwUpdate) {
    this.checkForUpdates();
  }

  /**
   * Uygulama güncellemelerini kontrol eder
   */
  private checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('Service Worker is not enabled');
      return;
    }

    // Yeni versiyon hazır olduğunda bildirim göster
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map(evt => ({
          type: 'UPDATE_AVAILABLE',
          current: evt.currentVersion,
          available: evt.latestVersion,
        }))
      )
      .subscribe(evt => {
        if (this.promptUser()) {
          this.swUpdate.activateUpdate().then(() => {
            document.location.reload();
          });
        }
      });

    // Her 6 saatte bir güncelleme kontrolü
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Kullanıcıya güncelleme istemi gösterir
   */
  private promptUser(): boolean {
    return confirm(
      'Yeni bir sürüm mevcut! Uygulamayı güncellemek ister misiniz?'
    );
  }
}
