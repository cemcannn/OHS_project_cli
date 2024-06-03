import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Create_Type_Of_Accident } from 'src/app/contracts/definitions/create_type_of_accident';
import { List_Type_Of_Accident } from 'src/app/contracts/definitions/list_type_of_accident';
import { Update_Type_Of_Accident } from 'src/app/contracts/definitions/update_type_of_accident';

@Injectable({
  providedIn: 'root'
})
export class TypeOfAccidentService {

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

  async createTypeOfAccident(typeOfAccident: Create_Type_Of_Accident, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "typeOfAccidents"
    }, typeOfAccident)
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

  async getTypeOfAccidentById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Type_Of_Accident> {
    const observable: Observable<List_Type_Of_Accident> = this.httpClientService.get<List_Type_Of_Accident>({
      controller: "typeOfAccidents"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getTypeOfAccidents(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Type_Of_Accident[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Type_Of_Accident[] }> = this.httpClientService.get({
      controller: "typeOfAccidents"
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateTypeOfAccident(typeOfAccident: Update_Type_Of_Accident, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "typeOfAccidents",
    }, typeOfAccident);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteTypeOfAccident(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "typeOfAccidents"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
