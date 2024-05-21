import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { Create_Accident } from 'src/app/contracts/accidents/create_accident';
import { HttpErrorResponse } from '@angular/common/http';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

@Injectable({
  providedIn: 'root'
})
export class AccidentService {

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

  async createAccident(accident: Create_Accident, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "accidents"
    }, accident)
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

  async getAccidentById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ datas: List_Accident[], totalCount: number }> {
    const observable: Observable<{ datas: List_Accident[], totalCount: number }> = this.httpClientService.get<{ datas: List_Accident[], totalCount: number }>({
      controller: "accidents"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getAccidents(page: number = 0, size: number = 5, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Accident[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Accident[] }> = this.httpClientService.get({
      controller: "accidents",
      queryString: `get-all-accidents`
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
