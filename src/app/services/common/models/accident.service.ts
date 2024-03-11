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

  async createAccident(accident: Create_Accident, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "accidents"
    }, accident)
      .subscribe(result => {
        successCallBack();
      }, (errorResponse: HttpErrorResponse) => {
        const _error: Array<{ key: string, value: Array<string> }> = errorResponse.error;
        let message = "";
        _error.forEach((v, index) => {
          v.value.forEach((_v, _index) => {
            message += `${_v}<br>`;
          });
        });
        errorCallBack(message);
      });
  }
  
// Update the return type of getAccidents method in AccidentService
async getAccidents(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ datas: List_Accident[], totalCount: number }> {
  const observable: Observable<{ datas: List_Accident[], totalCount: number }> = this.httpClientService.get<{ datas: List_Accident[], totalCount: number }>({
    controller: "accidents"
  }, id);

  const promiseData = firstValueFrom(observable);
  promiseData.then(value => successCallBack())
    .catch(error => errorCallBack(error));

  return await promiseData;
}

}