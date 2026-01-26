import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LoggingService } from '../services/common/logging.service';
import { Router } from '@angular/router';

/**
 * Global error handler
 * Tüm yakalanmamış hataları yakalar ve loglar
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: Error | any): void {
    const loggingService = this.injector.get(LoggingService);
    const router = this.injector.get(Router);

    // Hata detaylarını logla
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    console.error('Global Error Handler caught:', error);

    // Farklı hata tiplerini ayır
    if (this.isChunkLoadError(error)) {
      loggingService.warn('Chunk load error - possible new deployment', {
        error: errorMessage,
        url: window.location.href
      });
      
      // Kullanıcıyı bilgilendir ve sayfayı yenile
      if (confirm('Uygulama güncellenmiş. Sayfayı yenilemek ister misiniz?')) {
        window.location.reload();
      }
    } else if (this.isHttpError(error)) {
      loggingService.error('HTTP Error', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: errorMessage
      });
    } else if (error instanceof TypeError) {
      loggingService.error('Type Error', {
        message: errorMessage,
        stack: error.stack
      });
    } else {
      loggingService.error('Unhandled Error', {
        message: errorMessage,
        stack: error?.stack,
        type: error?.constructor?.name
      });
    }

    // Development'da hata fırlat
    if (!this.isProduction()) {
      throw error;
    }
  }

  private isChunkLoadError(error: any): boolean {
    return error?.message?.includes('Loading chunk') || 
           error?.message?.includes('ChunkLoadError');
  }

  private isHttpError(error: any): boolean {
    return error?.status !== undefined && error?.url !== undefined;
  }

  private isProduction(): boolean {
    return !window.location.hostname.includes('localhost');
  }
}
