import { Injectable } from '@angular/core';
import { Accident_Rate } from 'src/app/contracts/accidents/accident_rate';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

@Injectable({
  providedIn: 'root',
})
export class AccidentRateFilterService {
  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  constructor() {}

  private initializeAccidentRate(month: string = ''): Accident_Rate {
    return {
      month,
      zeroDay: 0,
      oneToFourDay: 0,
      fiveAboveDay: 0,
      totalAccidentNumber: 0,
      totalLostDayOfWork: 0
    };
  }

  private updateAccidentRate(accident: List_Accident, accidentRate: Accident_Rate): void {
    const lostDayOfWork = Number(accident.lostDayOfWork);
    if (lostDayOfWork === 0) accidentRate.zeroDay++;
    else if (lostDayOfWork <= 4) accidentRate.oneToFourDay++;
    else if (lostDayOfWork >= 5) accidentRate.fiveAboveDay++;

    accidentRate.totalAccidentNumber++;
    accidentRate.totalLostDayOfWork += lostDayOfWork;
  }

  calculateTotals(accidents: List_Accident[]): Accident_Rate[] {
    const accidentRates: { [month: string]: Accident_Rate } = {};
    this.monthNames.forEach((month) => accidentRates[month] = this.initializeAccidentRate(month));

    accidents.forEach((accident) => {
      const month = this.monthNames[new Date(accident.accidentDate).getMonth()];
      this.updateAccidentRate(accident, accidentRates[month]);
    });

    const totals = this.initializeAccidentRate('Toplam');
    Object.values(accidentRates).forEach((rate) => {
      totals.zeroDay += rate.zeroDay;
      totals.oneToFourDay += rate.oneToFourDay;
      totals.fiveAboveDay += rate.fiveAboveDay;
      totals.totalAccidentNumber += rate.totalAccidentNumber;
      totals.totalLostDayOfWork += rate.totalLostDayOfWork;
    });

    return [...Object.values(accidentRates), totals];
  }

  // Yıl bazında filtreleme ve toplam hesaplama
  filterByYear(accidentRates: List_Accident[], year: string): Accident_Rate[] {
    const filteredAccidents = accidentRates.filter(accident => new Date(accident.accidentDate).getFullYear().toString() === year);
    return this.calculateTotals(filteredAccidents); // Filtrelenmiş veriler için toplamları hesapla
  }

  // İşletme bazında filtreleme ve toplam hesaplama
  filterByDirectorate(accidentRates: List_Accident[], directorate: string): Accident_Rate[] {
    const filteredAccidents = accidentRates.filter(accident => accident.directorate === directorate);
    return this.calculateTotals(filteredAccidents); // Filtrelenmiş veriler için toplamları hesapla
  }

  // Çoklu filtreleme işlemi
  applyFilters(accidentRates: List_Accident[], filters: any): Accident_Rate[] {
    let filteredAccidentRates = accidentRates;

    if (filters.year) {
      filteredAccidentRates = filteredAccidentRates.filter(accident => new Date(accident.accidentDate).getFullYear().toString() === filters.year);
    }

    if (filters.directorate) {
      filteredAccidentRates = filteredAccidentRates.filter(accident => accident.directorate === filters.directorate);
    }

    return this.calculateTotals(filteredAccidentRates); // Filtrelenmiş veriler üzerinde toplam hesapla
  }
}