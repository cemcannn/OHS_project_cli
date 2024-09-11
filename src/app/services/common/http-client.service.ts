import { Inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { RequestParameters } from 'src/app/contracts/request-parameters';
import { OpenAiCodexService } from './open-ai-codex.service';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  constructor(private httpClient: HttpClient, @Inject("baseUrl") private baseUrl: string, private openAiCodexService: OpenAiCodexService) { }

  private url(requestParameter: Partial<RequestParameters>): string {
    return `${requestParameter.baseUrl ? requestParameter.baseUrl : this.baseUrl}/${requestParameter.controller}${requestParameter.action ? `/${requestParameter.action}` : ""}`;
  }

  get<T>(requestParameter: Partial<RequestParameters>, id?: string): Observable<T> {
    let url: string = "";
    if (requestParameter.fullEndPoint)
      url = requestParameter.fullEndPoint;
    else
      url = `${this.url(requestParameter)}${id ? `/${id}` : ""}${requestParameter.queryString ? `?${requestParameter.queryString}` : ""}`;

    return this.httpClient.get<T>(url, { headers: requestParameter.headers, responseType: requestParameter.responseType as 'json' });
  }

  post<T>(requestParameter: Partial<RequestParameters>, body: Partial<T>): Observable<T> {
    let url: string = "";
    if (requestParameter.fullEndPoint)
      url = requestParameter.fullEndPoint;
    else
      url = `${this.url(requestParameter)}${requestParameter.queryString ? `?${requestParameter.queryString}` : ""}`

    return this.httpClient.post<T>(url, body, { headers: requestParameter.headers, responseType: requestParameter.responseType as 'json' });
  }

  put<T>(requestParameter: Partial<RequestParameters>, body: Partial<T>): Observable<T> {
    let url: string = "";
    if (requestParameter.fullEndPoint)
      url = requestParameter.fullEndPoint;
    else
      url = `${this.url(requestParameter)}${requestParameter.queryString ? `?${requestParameter.queryString}` : ""}`;

    return this.httpClient.put<T>(url, body, { headers: requestParameter.headers, responseType: requestParameter.responseType as 'json' });
  }

  delete<T>(requestParameter: Partial<RequestParameters>, id: string): Observable<T> {
    let url: string = "";
    if (requestParameter.fullEndPoint)
      url = requestParameter.fullEndPoint;
    else
      url = `${this.url(requestParameter)}/${id}${requestParameter.queryString ? `?${requestParameter.queryString}` : ""}`;

    return this.httpClient.delete<T>(url, { headers: requestParameter.headers, responseType: requestParameter.responseType as 'json' });
  }

    /**
   * OpenAI Codex kullanarak kod tamamlamaları için bir metot
   * @param prompt Codex'e gönderilecek kod ya da soru
   */
    getCodexCompletion(prompt: string): Observable<any> {
      return this.openAiCodexService.getCodexCompletion(prompt);
    }
}