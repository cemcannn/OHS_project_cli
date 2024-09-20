// src/app/services/common/personnel-filter.service.ts

import { Injectable } from '@angular/core';
import { List_Personnel } from 'src/app/contracts/personnels/list_personnel';

@Injectable({
  providedIn: 'root',
})
export class PersonnelFilterService {
  applyFilters(personnelList: List_Personnel[], filters: any): List_Personnel[] {
    let filteredPersonnel = personnelList;

    if (filters.directorate && filters.directorate !== 'Tüm İşletmeler') {
      filteredPersonnel = filteredPersonnel.filter(
        (personnel) => personnel.directorate === filters.directorate
      );
    }

    return filteredPersonnel;
  }
}
