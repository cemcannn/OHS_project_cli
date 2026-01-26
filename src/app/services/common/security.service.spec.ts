import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DomSanitizer', ['sanitize', 'bypassSecurityTrustHtml']);
    
    TestBed.configureTestingModule({
      providers: [
        SecurityService,
        { provide: DomSanitizer, useValue: spy }
      ]
    });
    
    service = TestBed.inject(SecurityService);
    sanitizerSpy = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('escapeHtml', () => {
    it('should escape HTML tags', () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = service.escapeHtml(malicious);
      
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    it('should escape special characters', () => {
      const text = 'Hello & "World"';
      const escaped = service.escapeHtml(text);
      
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;');
    });
  });

  describe('sanitizeSqlInput', () => {
    it('should escape single quotes', () => {
      const input = "It's a test";
      const sanitized = service.sanitizeSqlInput(input);
      
      expect(sanitized).toBe("It''s a test");
    });

    it('should remove SQL comments', () => {
      const input = 'SELECT * FROM users -- comment';
      const sanitized = service.sanitizeSqlInput(input);
      
      expect(sanitized).not.toContain('--');
    });

    it('should remove statement separators', () => {
      const input = 'SELECT * FROM users; DROP TABLE users;';
      const sanitized = service.sanitizeSqlInput(input);
      
      expect(sanitized).not.toContain(';');
    });
  });

  describe('isUrlSafe', () => {
    it('should reject javascript: URLs', () => {
      expect(service.isUrlSafe('javascript:alert(1)')).toBeFalse();
    });

    it('should reject data: URLs', () => {
      expect(service.isUrlSafe('data:text/html,<script>alert(1)</script>')).toBeFalse();
    });

    it('should accept http URLs', () => {
      expect(service.isUrlSafe('http://example.com')).toBeTrue();
    });

    it('should accept https URLs', () => {
      expect(service.isUrlSafe('https://example.com')).toBeTrue();
    });

    it('should handle case insensitivity', () => {
      expect(service.isUrlSafe('JaVaScRiPt:alert(1)')).toBeFalse();
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(service.isValidEmail('test@example.com')).toBeTrue();
    });

    it('should reject invalid email without @', () => {
      expect(service.isValidEmail('testexample.com')).toBeFalse();
    });

    it('should reject invalid email without domain', () => {
      expect(service.isValidEmail('test@')).toBeFalse();
    });
  });

  describe('isFileExtensionSafe', () => {
    const allowedExtensions = ['jpg', 'png', 'pdf'];

    it('should accept allowed extension', () => {
      expect(service.isFileExtensionSafe('document.pdf', allowedExtensions)).toBeTrue();
    });

    it('should reject disallowed extension', () => {
      expect(service.isFileExtensionSafe('script.exe', allowedExtensions)).toBeFalse();
    });

    it('should be case insensitive', () => {
      expect(service.isFileExtensionSafe('IMAGE.PNG', allowedExtensions)).toBeTrue();
    });

    it('should reject files without extension', () => {
      expect(service.isFileExtensionSafe('filename', allowedExtensions)).toBeFalse();
    });
  });

  describe('generateCsrfToken', () => {
    it('should generate a token', () => {
      const token = service.generateCsrfToken();
      
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = service.generateCsrfToken();
      const token2 = service.generateCsrfToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('sanitizeFilePath', () => {
    it('should remove path traversal attempts', () => {
      const path = '../../../etc/passwd';
      const sanitized = service.sanitizeFilePath(path);
      
      expect(sanitized).not.toContain('..');
    });

    it('should remove double slashes', () => {
      const path = 'path//to///file';
      const sanitized = service.sanitizeFilePath(path);
      
      expect(sanitized).toBe('path/to/file');
    });

    it('should remove leading slashes', () => {
      const path = '/var/www/file.txt';
      const sanitized = service.sanitizeFilePath(path);
      
      expect(sanitized).not.toMatch(/^\//);
    });
  });
});
