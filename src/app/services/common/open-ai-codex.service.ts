import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenAiCodexService {
  private apiUrl = 'https://api.openai.com/v1/completions';
  private apiKey = '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';  // Buraya OpenAI API anahtarını eklemelisin

  constructor(private httpClient: HttpClient) { }

  getCodexCompletion(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`  // Bearer token olarak API anahtarını ekle
    });

    const body = {
      model: 'davinci-002',  // OpenAI Codex modeli
      prompt: prompt,
      max_tokens: 150,
      temperature: 0
    };

    return this.httpClient.post<any>(this.apiUrl, body, { headers }).pipe(
        catchError(error => {
          console.error('Error occurred:', error);  // Konsolda hata mesajını yazdır
          return throwError(() => new Error('An error occurred while fetching the completion'));  // Hata mesajını döndür
        })
      );
    }
  }

