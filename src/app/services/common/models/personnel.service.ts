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
    constructor(private httpClientService: HttpClientService, private toastrService: CustomToastrService) { }

    async getPersonnels(page: number = 0, size: number = 5, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void): Promise<{ totalCount: number; datas: List_Personnel[] }> {
        const observable: Observable<{ totalCount: number; datas: List_Personnel[] }> = this.httpClientService.get({
          controller: "personnels",
          queryString: `get-all-personnels`
        });
    
        const promiseData = firstValueFrom(observable);
        promiseData.then(value => successCallBack())
          .catch(error => errorCallBack(error));
    
        return await promiseData;
      }

      async getPersonnelById(id: string, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
        const observable: Observable<List_Personnel> = this.httpClientService.get<List_Personnel>({
          controller: "personnels"
        }, id);
    
        const promiseData = firstValueFrom(observable);
        promiseData.then(value => successCallBack())
          .catch(error => errorCallBack(error))
    
        return await promiseData;
      }

      async createPersonnel(personnel: Create_Personnel, successCallBack?: () => void, errorCallBack?: (errorMessage: string) => void) {
        this.httpClientService.post({
          controller: "personnels"
        }, personnel)
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
    }