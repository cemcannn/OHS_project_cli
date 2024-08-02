import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Create_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/create_actual_daily_wage';
import { List_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/list_actual_daily_wage';
import { Update_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/update_actual_daily_wage';


@Injectable({
  providedIn: 'root'
})
export class ActualDailyWageService {

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

  async createActualDailyWage(actualDailyWage: Create_Actual_Daily_Wage, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "accidentStatistics"
    }, actualDailyWage)
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

//   async getActualDailyWageById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Actual_Daily_Wage> {
//     const observable: Observable<List_Actual_Daily_Wage> = this.httpClientService.get<List_Actual_Daily_Wage>({
//       controller: "actualDailyWages"
//     }, id);
//     return this.handleRequest(observable, successCallBack, errorCallBack);
//   }

  async getActualDailyWages(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Actual_Daily_Wage[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Actual_Daily_Wage[] }> = this.httpClientService.get({
      controller: "accidentStatistics"
    });
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateActualDailyWage(actualDailyWage: Update_Actual_Daily_Wage, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "accidentStatistics",
    }, actualDailyWage);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteActualDailyWage(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "accidentStatistics"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
