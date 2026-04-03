import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { firstValueFrom, Observable } from 'rxjs';
import { Create_Accident_Area } from 'src/app/contracts/definitions/accident_area/create_accident_area';
import { List_Accident_Area } from 'src/app/contracts/definitions/accident_area/list_accident_area';
import { Update_Accident_Area } from 'src/app/contracts/definitions/accident_area/update_accident_area';

@Injectable({
  providedIn: 'root'
})
export class AccidentAreaService {

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

  async createAccidentArea(accidentArea: Create_Accident_Area, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.post({
      controller: "accidentAreas"
    }, accidentArea);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getAccidentAreaById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Accident_Area> {
    const observable: Observable<List_Accident_Area> = this.httpClientService.get<List_Accident_Area>({
      controller: "accidentAreas"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getAccidentAreas(successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Accident_Area[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Accident_Area[] }> = this.httpClientService.get({
      controller: "accidentAreas"
    });

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async updateAccidentArea(accidentArea: Update_Accident_Area, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.put({
      controller: "accidentAreas",
    }, accidentArea);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async deleteAccidentArea(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    const observable = this.httpClientService.delete({
      controller: "accidentAreas"
    }, id);

    return this.handleRequest(observable, successCallBack, errorCallBack);
  }
}
