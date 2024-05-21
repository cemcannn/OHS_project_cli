import { Injectable } from "@angular/core";
import { HttpClientService } from "../http-client.service";
import { CustomToastrService } from "../../ui/custom-toastr.service";
import { List_Personnel } from "src/app/contracts/personnels/list_personnel";
import { Observable, firstValueFrom } from "rxjs";
import { Create_Personnel } from "src/app/contracts/personnels/create_personnel";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PersonnelService {
  constructor(
    private httpClientService: HttpClientService, 
    private toastrService: CustomToastrService
  ) { }

  private async handleRequest<T>(observable: Observable<T>, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<T> {
    const promiseData = firstValueFrom(observable);
    promiseData.then(value => {
      if (successCallBack) successCallBack();
    }).catch((error: HttpErrorResponse) => {
      if (errorCallBack) errorCallBack(error.message);
    });
    return await promiseData;
  }

  async getPersonnels(page: number = 0, size: number = 5, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Personnel[] }> {
    const observable: Observable<{ totalCount: number; datas: List_Personnel[] }> = this.httpClientService.get({
      controller: "personnels",
      queryString: `get-all-personnels`
    });
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async getPersonnelById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<List_Personnel> {
    const observable: Observable<List_Personnel> = this.httpClientService.get<List_Personnel>({
      controller: "personnels"
    }, id);
    return this.handleRequest(observable, successCallBack, errorCallBack);
  }

  async createPersonnel(personnel: Create_Personnel, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
    this.httpClientService.post({
      controller: "personnels"
    }, personnel)
      .subscribe(result => {
        if (successCallBack) successCallBack();
      }, (errorResponse: HttpErrorResponse) => {
        const _error: Array<{ key: string, value: Array<string> }> = errorResponse.error;
        let message = "";
        _error.forEach((v) => {
          v.value.forEach((_v) => {
            message += `${_v}<br>`;
          });
        });
        if (errorCallBack) errorCallBack(message);
      });
  }
}
