import { Injectable } from '@angular/core';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';

@Injectable({
  providedIn: 'root',
})
export class AccidentStatisticFilterService {
  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  constructor() {}

  // Yıllara göre gruplama
  filterByYear(accidentStatistics: List_Accident_Statistic[], year: string): List_Accident_Statistic[] {
    return accidentStatistics.filter(accidentStatistics => accidentStatistics.year === year);
  }

  // İşletmelere (Directorates) göre gruplama
  filterByDirectorate(accidentStatistics: List_Accident_Statistic[], directorate: string): List_Accident_Statistic[] {
    return accidentStatistics.filter(accidentStatistics => accidentStatistics.directorate === directorate);
  }

  // Çoklu filtreleme işlemi
  applyFilters(accidentStatistics: List_Accident_Statistic[], filters: any): List_Accident_Statistic[] {
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