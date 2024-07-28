import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Create_Directorate } from 'src/app/contracts/definitions/directorate/create_directorate';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { Update_Directorate } from 'src/app/contracts/definitions/directorate/update_directorate';


@Injectable({
  providedIn: 'root'
})
export class DirectorateService {

  constructor(private httpClientService: HttpClientService) { }

  private async handleRequest<T>(observable: Observable<T>, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<T> {
    const promiseData = firstValueFrom(observable);
    promiseData.then(value => {
      if (successCallBack) successCallBack();
    }).catch(error => {
      if (errorCallBack) errorCallBack(error);
    });
    return await promiseData;
  }

  async createDirectorate(directorate: Create_Directorate, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "directorates"
    }, directorate)
      .subscribe(result => {
        if (successCallBack) successCallBack();
      }, (errorResponse: HttpErrorResponse) => {
        const _error: Array<{ key: string, value: Array<string> }> = errorResponse.error;
        let message = "";
        _error.forEach((v, index) => {
          v.value.forEach((_v, _index) => {
            message += `${_v}<br>`;
          });
        });
        if (errorCallBack) errorCallBack(message);
      });
  }

  async getDirectorateById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Directorate> {
    const observable: Observable<List_Directorate> = this.httpClientService.get<List_Directorate>({
      controller: "directorates"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getDirectorates(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Directorate[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Directorate[] }> = this.httpClientService.get({
      controller: "directorates"
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateDirectorate(directorate: Update_Directorate, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "directorates",
    }, directorate);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteDirectorate(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "directorates"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
