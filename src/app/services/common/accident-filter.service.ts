// AccidentFilterService - mevcut servisini genişletiyoruz
import { Injectable } from '@angular/core';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

@Injectable({
  providedIn: 'root',
})
export class AccidentFilterService {
  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  constructor() {}

  // Aylara göre gruplama
  filterByMonth(accidents: List_Accident[], month: string): List_Accident[] {
    return accidents.filter(accident => {
      const accidentMonth = this.monthNames[new Date(accident.accidentDate).getMonth()];
      return accidentMonth === month;
    });
  }

  // Yıllara göre gruplama
  filterByYear(accidents: List_Accident[], year: string): List_Accident[] {
    return accidents.filter(accident => new Date(accident.accidentDate).getFullYear().toString() === year);
  }

  // İşletmelere (Directorates) göre gruplama
  filterByDirectorate(accidents: List_Accident[], directorate: string): List_Accident[] {
    return accidents.filter(accident => accident.directorate === directorate);
  }

  // Çoklu filtreleme işlemi
  applyFilters(accidents: List_Accident[], filters: any): List_Accident[] {
    let filteredAccidents = accidents;

    if (filters.month) {
      filteredAccidents = this.filterByMonth(filteredAccidents, filters.month);
    }

    if (filters.year) {
      filteredAccidents = this.filterByYear(filteredAccidents, filters.year);
    }

    if (filters.directorate) {
      filteredAccidents = this.filterByDirectorate(filteredAccidents, filters.directorate);
    }

    return filteredAccidents;
  }
}
