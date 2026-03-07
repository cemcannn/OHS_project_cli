import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClientService } from '../http-client.service';

export interface AuditLogDto {
  id: string;
  userName: string;
  action: string;
  requestType: string;
  timestamp: string;
}

export interface AuditLogsResponse {
  logs: AuditLogDto[];
  totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  constructor(private httpClientService: HttpClientService) {}

  async getLogs(page: number, size: number, userName?: string): Promise<AuditLogsResponse> {
    let queryString = `page=${page}&size=${size}`;
    if (userName) queryString += `&userName=${encodeURIComponent(userName)}`;

    return await firstValueFrom(
      this.httpClientService.get<AuditLogsResponse>({
        controller: 'auditlogs',
        queryString
      })
    );
  }
}
