import { Injectable } from '@angular/core';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';
import { List_Monthly_Directorate_Data } from 'src/app/contracts/monthly_directorate_data/list-monthly-directorate-data';

@Injectable({
  providedIn: 'root',
})
export class MonthlyDirectorateFilterService {
  constructor() {}

  // Yıllara göre gruplama
  filterByYear(accidentStatistics: List_Monthly_Directorate_Data[], year: string): List_Monthly_Directorate_Data[] {
    return accidentStatistics.filter(accidentStatistics => accidentStatistics.year === year);
  }

  // İşletmelere (Directorates) göre gruplama
  filterByDirectorate(accidentStatistics: List_Monthly_Directorate_Data[], directorate: string): List_Monthly_Directorate_Data[] {
    return accidentStatistics.filter(accidentStatistics => accidentStatistics.directorate === directorate);
  }

  // Çoklu filtreleme işlemi
  applyFilters(accidentStatistics: List_Monthly_Directorate_Data[], filters: any): List_Monthly_Directorate_Data[] {
    let filteredAccidentStatistics = accidentStatistics;

    if (filters.year) {
      filteredAccidentStatistics = this.filterByYear(filteredAccidentStatistics, filters.year);
    }

    if (filters.directorate) {
      filteredAccidentStatistics = this.filterByDirectorate(filteredAccidentStatistics, filters.directorate);
    }

    return filteredAccidentStatistics;
  }
}