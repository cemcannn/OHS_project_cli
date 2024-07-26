import { Injectable } from '@angular/core';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { Accident_Rate } from 'src/app/contracts/accidents/accident_rate';

@Injectable({
  providedIn: 'root'
})
export class AccidentRateService {

  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  constructor() { }

  groupByMonth(accidents: List_Accident[]): Accident_Rate[] {
    const accidentRates: { [month: string]: Accident_Rate } = {};

    // Initialize the accidentRates object with all months
    this.monthNames.forEach(month => {
      accidentRates[month] = {
        month: month,
        zeroDay: 0,
        oneToFourDay: 0,
        fiveAboveDay: 0,
        totalAccidentNumber: 0,
        totalWorkDay: 0,
      };
    });

    accidents.forEach(accident => {
      const monthIndex = new Date(accident.accidentDate).getMonth();
      const month = this.monthNames[monthIndex];
      const reportDay = Number(accident.reportDay); 

      const accidentRate = accidentRates[month];

      if (reportDay === 0) {
        accidentRate.zeroDay += 1;
      } else if (reportDay >= 1 && reportDay <= 4) {
        accidentRate.oneToFourDay += 1;
      } else if (reportDay >= 5) {
        accidentRate.fiveAboveDay += 1;
      }

      accidentRate.totalAccidentNumber += 1;
      accidentRate.totalWorkDay += reportDay;
    });

    return Object.values(accidentRates);
  }

  private calculateReportDay(onTheJobDate: Date, accidentDate: Date): number {
    return Math.ceil((onTheJobDate.getTime() - accidentDate.getTime()) / (1000 * 3600 * 24));
  }
}
