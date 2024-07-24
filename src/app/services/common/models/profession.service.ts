import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClientService } from '../http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Create_Profession } from 'src/app/contracts/definitions/profession/create_profession';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { Update_Profession } from 'src/app/contracts/definitions/profession/update_profession';

@Injectable({
  providedIn: 'root'
})
export class ProfessionService {

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

  async createProfession(profession: Create_Profession, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "professions"
    }, profession)
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

  async getProfessionById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Profession> {
    const observable: Observable<List_Profession> = this.httpClientService.get<List_Profession>({
      controller: "professions"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getProfessions(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Profession[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Profession[] }> = this.httpClientService.get({
      controller: "professions"
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateProfession(profession: Update_Profession, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "professions",
    }, profession);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteProfession(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "professions"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
