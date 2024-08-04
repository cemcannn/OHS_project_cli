import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';
import { Update_Accident_Statistic } from 'src/app/contracts/accident_statistic/update-accident-statistic';
import { Create_Accident_Statistic } from 'src/app/contracts/accident_statistic/create-accident-statistic';


@Injectable({
  providedIn: 'root'
})
export class AccidentStatisticService {

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

  async createAccidentStatistic(accidentStatistic: Create_Accident_Statistic, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "accidentStatistics"
    }, accidentStatistic)
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

//   async getAccidentStatisticById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Accident_Statistic> {
//     const observable: Observable<List_Accident_Statistic> = this.httpClientService.get<List_Accident_Statistic>({
//       controller: "accidentStatistics"
//     }, id);
//     return this.handleRequest(observable, successCallBack, errorCallBack);
//   }

  async getAccidentStatistics(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Accident_Statistic[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Accident_Statistic[] }> = this.httpClientService.get({
      controller: "accidentStatistics"
    });
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateAccidentStatistic(accidentStatistic: Update_Accident_Statistic, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "accidentStatistics",
    }, accidentStatistic);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteAccidentStatistic(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "accidentStatistics"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
