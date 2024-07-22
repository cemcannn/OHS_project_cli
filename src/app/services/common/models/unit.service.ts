import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Create_Unit } from 'src/app/contracts/definitions/unit/create_unit';
import { List_Unit } from 'src/app/contracts/definitions/unit/list_unit';
import { Update_Unit } from 'src/app/contracts/definitions/unit/update_unit';


@Injectable({
  providedIn: 'root'
})
export class UnitService {

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

  async createUnit(unit: Create_Unit, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "units"
    }, unit)
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

  async getUnitById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Unit> {
    const observable: Observable<List_Unit> = this.httpClientService.get<List_Unit>({
      controller: "units"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getUnits(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Unit[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Unit[] }> = this.httpClientService.get({
      controller: "units"
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateUnit(unit: Update_Unit, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "units",
    }, unit);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteUnit(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "units"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
