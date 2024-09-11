import { Injectable } from '@angular/core';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { Accident_Rate } from 'src/app/contracts/accidents/accident_rate';

@Injectable({
  providedIn: 'root'
})
export class AccidentRateService {

  private readonly monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  constructor() { }

  private initializeAccidentRate(): Accident_Rate {
    return {
      month: '',
      zeroDay: 0,
      oneToFourDay: 0,
      fiveAboveDay: 0,
      totalAccidentNumber: 0,
      totalLostDayOfWork: 0
    };
  }

  private updateAccidentRate(accident: List_Accident, accidentRate: Accident_Rate): void {
    const lostDayOfWork = Number(accident.lostDayOfWork);

    if (lostDayOfWork === 0) {
      accidentRate.zeroDay += 1;
    } else if (lostDayOfWork >= 1 && lostDayOfWork <= 4) {
      accidentRate.oneToFourDay += 1;
    } else if (lostDayOfWork >= 5) {
      accidentRate.fiveAboveDay += 1;
    }

    accidentRate.totalAccidentNumber += 1;
    accidentRate.totalLostDayOfWork += lostDayOfWork;
  }

  groupByMonth(accidents: List_Accident[]): Accident_Rate[] {
    const accidentRates: { [month: string]: Accident_Rate } = {};

    this.monthNames.forEach(month => {
      accidentRates[month] = { ...this.initializeAccidentRate(), month };
    });

    accidents.forEach(accident => {
      const month = this.monthNames[new Date(accident.accidentDate).getMonth()];
      this.updateAccidentRate(accident, accidentRates[month]);
    });

    const totals = this.initializeAccidentRate();
    totals.month = 'Toplam';

    Object.values(accidentRates).forEach(rate => {
      totals.zeroDay += rate.zeroDay;
      totals.oneToFourDay += rate.oneToFourDay;
      totals.fiveAboveDay += rate.fiveAboveDay;
      totals.totalAccidentNumber += rate.totalAccidentNumber;
      totals.totalLostDayOfWork += rate.totalLostDayOfWork;
    });

    return [...Object.values(accidentRates), totals];
  }

  groupByYear(accidents: List_Accident[]): { [year: string]: List_Accident[] } {
    return accidents.reduce((acc, accident) => {
      const year = new Date(accident.accidentDate).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(accident);
      return acc;
    }, {} as { [year: string]: List_Accident[] });
  }

  groupByYearChart(accidents: List_Accident[]): any[] {
    const yearlyData: { [key: string]: any } = {};

    accidents.forEach(accident => {
      const year = new Date(accident.accidentDate).getFullYear().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year: year,
          lostDayOfWorkSummary: 0,
          // Diğer özellikler eklenebilir...
        };
      }

      yearlyData[year].lostDayOfWorkSummary += Number(accident.lostDayOfWork);
    });

    return Object.values(yearlyData);
  }

  groupByDirectorate(accidents: List_Accident[]): { [directorate: string]: Accident_Rate[] } {
    const directorateData: { [key: string]: { [month: string]: Accident_Rate } } = {};

    accidents.forEach(accident => {
      const directorate = accident.directorate || 'Diğer';
      const month = this.monthNames[new Date(accident.accidentDate).getMonth()];

      if (!directorateData[directorate]) {
        directorateData[directorate] = {};
        this.monthNames.forEach(monthName => {
          directorateData[directorate][monthName] = { ...this.initializeAccidentRate(), month: monthName };
        });
      }

      this.updateAccidentRate(accident, directorateData[directorate][month]);
    });

    const result = {};
    for (const directorate in directorateData) {
      if (directorateData.hasOwnProperty(directorate)) {
        result[directorate] = [...Object.values(directorateData[directorate])];
      }
    }

    return result;
  }
}
