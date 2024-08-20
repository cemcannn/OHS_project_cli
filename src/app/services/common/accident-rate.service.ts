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
        totalLostDayOfWork: 0,
      };
    });

    accidents.forEach(accident => {
      const monthIndex = new Date(accident.accidentDate).getMonth();
      const month = this.monthNames[monthIndex];
      const lostDayOfWork = Number(accident.lostDayOfWork); 

      const accidentRate = accidentRates[month];

      if (lostDayOfWork === 0) {
        accidentRate.zeroDay += 1;
      } else if (lostDayOfWork >= 1 && lostDayOfWork <= 4) {
        accidentRate.oneToFourDay += 1;
      } else if (lostDayOfWork >= 5) {
        accidentRate.fiveAboveDay += 1;
      }

      accidentRate.totalAccidentNumber += 1;
      accidentRate.totalLostDayOfWork += lostDayOfWork;
    });

    // Calculate totals
    const totals = {
      month: 'Toplam',
      zeroDay: 0,
      oneToFourDay: 0,
      fiveAboveDay: 0,
      totalAccidentNumber: 0,
      totalLostDayOfWork: 0,
    };

    for (const key in accidentRates) {
      if (accidentRates.hasOwnProperty(key)) {
        totals.zeroDay += accidentRates[key].zeroDay;
        totals.oneToFourDay += accidentRates[key].oneToFourDay;
        totals.fiveAboveDay += accidentRates[key].fiveAboveDay;
        totals.totalAccidentNumber += accidentRates[key].totalAccidentNumber;
        totals.totalLostDayOfWork += accidentRates[key].totalLostDayOfWork;
      }
    }

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
  
    // Initialize the yearlyData object with all years
    accidents.forEach(accident => {
      const year = new Date(accident.accidentDate).getFullYear().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year: year,
          lostDayOfWorkSummary: 0,
          // Other properties...
        };
      }
  
      yearlyData[year].lostDayOfWorkSummary += Number(accident.lostDayOfWork);
      // Update other properties if needed...
    });

    return Object.values(yearlyData);
  }  

  groupByDirectorate(accidents: List_Accident[]): { [directorate: string]: Accident_Rate[] } {
    const directorateData: { [key: string]: { [month: string]: Accident_Rate } } = {};

    accidents.forEach(accident => {
      const directorate = accident.directorate || 'Diğer'; // Eğer işletme bilgisi yoksa 'Diğer' olarak adlandırılır
      const monthIndex = new Date(accident.accidentDate).getMonth();
      const month = this.monthNames[monthIndex];
      const lostDayOfWork = Number(accident.lostDayOfWork);

      if (!directorateData[directorate]) {
        directorateData[directorate] = {};
        this.monthNames.forEach(monthName => {
          directorateData[directorate][monthName] = {
            month: monthName,
            zeroDay: 0,
            oneToFourDay: 0,
            fiveAboveDay: 0,
            totalAccidentNumber: 0,
            totalLostDayOfWork: 0,
          };
        });
      }

      const accidentRate = directorateData[directorate][month];

      if (lostDayOfWork === 0) {
        accidentRate.zeroDay += 1;
      } else if (lostDayOfWork >= 1 && lostDayOfWork <= 4) {
        accidentRate.oneToFourDay += 1;
      } else if (lostDayOfWork >= 5) {
        accidentRate.fiveAboveDay += 1;
      }

      accidentRate.totalAccidentNumber += 1;
      accidentRate.totalLostDayOfWork += lostDayOfWork;
    });

    const result = {};
    for (const directorate in directorateData) {
      if (directorateData.hasOwnProperty(directorate)) {
        const monthlyData = directorateData[directorate];
        result[directorate] = [...Object.values(monthlyData)];
      }
    }

    return result;
  }
}
