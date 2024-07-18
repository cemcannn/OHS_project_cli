import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Create_Limb } from 'src/app/contracts/definitions/limb/create_limb';
import { List_Limb } from 'src/app/contracts/definitions/limb/list_limb';
import { Update_Limb } from 'src/app/contracts/definitions/limb/update_limb';


@Injectable({
  providedIn: 'root'
})
export class LimbService {

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

  async createLimb(limb: Create_Limb, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "limbs"
    }, limb)
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

  async getLimbById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Limb> {
    const observable: Observable<List_Limb> = this.httpClientService.get<List_Limb>({
      controller: "limbs"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getLimbs(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Limb[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Limb[] }> = this.httpClientService.get({
      controller: "limbs"
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateLimb(limb: Update_Limb, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "limbs",
    }, limb);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteLimb(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "limbs"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
