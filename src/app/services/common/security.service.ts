import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from '@angular/platform-browser';

/**
 * XSS (Cross-Site Scripting) saldırılarına karşı koruma servisi
 */
@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * HTML içeriğini sanitize eder
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) as any || '';
  }

  /**
   * URL'i sanitize eder
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(4, url) as any || '';
  }

  /**
   * Script içeriğini sanitize eder (çok dikkatli kullanılmalı!)
   */
  sanitizeScript(script: string): SafeScript {
    return this.sanitizer.sanitize(5, script) as any || '';
  }

  /**
   * CSS style'ı sanitize eder
   */
  sanitizeStyle(style: string): SafeStyle {
    return this.sanitizer.sanitize(3, style) as any || '';
  }

  /**
   * Resource URL'i sanitize eder (iframe src vb.)
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.sanitize(2, url) as any || '';
  }

  /**
   * Kullanıcı inputunu güvenli hale getirir
   * HTML tag'lerini encode eder
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * SQL injection koruması için string'i sanitize eder
   */
  sanitizeSqlInput(input: string): string {
    if (!input) return '';
    
    // Tehlikeli karakterleri kaldır/escape et
    return input
      .replace(/'/g, "''")  // Single quote escape
      .replace(/--/g, '')   // SQL comment
      .replace(/;/g, '')    // Statement separator
      .replace(/\/\*/g, '') // Multi-line comment start
      .replace(/\*\//g, ''); // Multi-line comment end
  }

  /**
   * Güvenli olmayan URL'leri kontrol eder
   */
  isUrlSafe(url: string): boolean {
    if (!url) return false;
    
    const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase().trim();
    
    return !dangerous.some(prefix => lowerUrl.startsWith(prefix));
  }

  /**
   * Email adresini validate eder
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Dosya uzantısının güvenli olup olmadığını kontrol eder
   */
  isFileExtensionSafe(filename: string, allowedExtensions: string[]): boolean {
    if (!filename) return false;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension) return false;
    
    return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
  }

  /**
   * CSRF token oluşturur
   */
  generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Path traversal saldırılarına karşı dosya yolu sanitize eder
   */
  sanitizeFilePath(path: string): string {
    if (!path) return '';
    
    // ../, ..\, //, \\  gibi tehlikeli pattern'leri kaldır
    return path
      .replace(/\.\./g, '')
      .replace(/[\/\\]{2,}/g, '/')
      .replace(/^[\/\\]/, '')
      .trim();
  }
}
