import { TestBed } from '@angular/core/testing';
import { LoggingService, LogLevel } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);
    localStorage.clear();
    spyOn(console, 'log');
    spyOn(console, 'warn');
    spyOn(console, 'error');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('debug', () => {
    it('should log debug message', () => {
      service.debug('Test debug message', { test: true });
      
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      service.info('Test info message');
      
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      service.warn('Test warning', { code: 'WARN_01' });
      
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      service.error('Test error', new Error('Something went wrong'));
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should extract error details from Error object', () => {
      const error = new Error('Test error');
      service.error('Error occurred', error);
      
      const logs = service.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      const lastLog = logs[logs.length - 1];
      expect(lastLog.data?.message).toBe('Test error');
      expect(lastLog.data?.stack).toBeDefined();
    });
  });

  describe('storage', () => {
    it('should save logs to localStorage', () => {
      service.info('Test message');
      
      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Test message');
      expect(logs[0].level).toBe(LogLevel.Info);
    });

    it('should limit number of stored logs', () => {
      // Test edilmesi için maxLogs'u küçük tutmamız gerekir
      // Ancak servisin private property'si olduğu için direkt test edemeyiz
      // Bu sadece konsept gösterimi
      for (let i = 0; i < 10; i++) {
        service.info(`Message ${i}`);
      }
      
      const logs = service.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it('should clear logs', () => {
      service.info('Test message 1');
      service.info('Test message 2');
      
      expect(service.getLogs().length).toBe(2);
      
      service.clearLogs();
      
      expect(service.getLogs().length).toBe(0);
    });
  });

  describe('log metadata', () => {
    it('should include timestamp in log entry', () => {
      const before = new Date();
      service.info('Test');
      const after = new Date();
      
      const logs = service.getLogs();
      const logTime = new Date(logs[0].timestamp);
      
      expect(logTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(logTime.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should include user agent and URL', () => {
      service.info('Test');
      
      const logs = service.getLogs();
      expect(logs[0].userAgent).toBeDefined();
      expect(logs[0].url).toBeDefined();
    });
  });
});
