import { Injectable } from '@angular/core';

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Fatal = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  stack?: string;
  userAgent?: string;
  url?: string;
}

/**
 * Client-side loglama servisi
 * Production'da Sentry veya benzeri bir servise gönderilebilir
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly storageKey = 'app_logs';
  private readonly maxLogs = 1000;
  private minLogLevel: LogLevel = LogLevel.Info;

  constructor() {
    // Production'da sadece hataları logla
    this.minLogLevel = this.isProduction() ? LogLevel.Error : LogLevel.Debug;
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.Debug, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.Info, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.Warn, message, data);
  }

  error(message: string, error?: any): void {
    const logData = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;
    
    this.log(LogLevel.Error, message, logData, error?.stack);
  }

  fatal(message: string, error?: any): void {
    const logData = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;
    
    this.log(LogLevel.Fatal, message, logData, error?.stack);
    
    // Fatal hataları backend'e gönder
    this.sendToServer({
      level: LogLevel.Fatal,
      message,
      data: logData,
      stack: error?.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  private log(level: LogLevel, message: string, data?: any, stack?: string): void {
    if (level < this.minLogLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Console'a yaz
    this.writeToConsole(entry);

    // LocalStorage'a kaydet
    this.saveToStorage(entry);
  }

  private writeToConsole(entry: LogEntry): void {
    const prefix = `[${LogLevel[entry.level]}] ${entry.timestamp.toISOString()}`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.Debug:
      case LogLevel.Info:
        console.log(message, entry.data || '');
        break;
      case LogLevel.Warn:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.Error:
      case LogLevel.Fatal:
        console.error(message, entry.data || '');
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  private saveToStorage(entry: LogEntry): void {
    try {
      const logs = this.getLogs();
      logs.push(entry);

      // Maksimum log sayısını aşarsa eski logları sil
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log to storage:', error);
    }
  }

  getLogs(): LogEntry[] {
    try {
      const logsJson = localStorage.getItem(this.storageKey);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch {
      return [];
    }
  }

  clearLogs(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Logları backend'e gönder (opsiyonel)
   */
  private sendToServer(entry: LogEntry): void {
    // TODO: Backend endpoint'e POST request
    // Bu kısım production'da Sentry, LogRocket vb. ile entegre edilebilir
    
    if (!this.isProduction()) {
      console.log('Would send to server:', entry);
    }
  }

  private isProduction(): boolean {
    return !window.location.hostname.includes('localhost');
  }
}
