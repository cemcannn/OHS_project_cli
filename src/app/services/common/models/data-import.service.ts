import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ImportResult {
  success: boolean;
  lines: string[];
}

@Injectable({ providedIn: 'root' })
export class DataImportService {

  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private buildHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  importVeri(file: File, directorate: string, year: string): Observable<ImportResult> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('directorate', directorate);
    form.append('year', year);
    return this.http.post<ImportResult>(
      `${this.baseUrl}/v1/dataimport/veri`,
      form,
      { headers: this.buildHeaders() }
    );
  }

  importYevmiye(file: File): Observable<ImportResult> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ImportResult>(
      `${this.baseUrl}/v1/dataimport/yevmiye`,
      form,
      { headers: this.buildHeaders() }
    );
  }
}
