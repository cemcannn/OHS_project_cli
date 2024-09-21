import { Injectable } from '@angular/core';
import { AccidentRateService } from './accident-rate.service';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  constructor(private accidentRateService: AccidentRateService) {}

  getMonthNames(): string[] {
    return this.monthNames;
  }

  private calculateSummaryFields(stat: List_Accident_Statistic, data: any): void {
    data.actualDailyWageSurface += Number(stat.actualDailyWageSurface);
    data.actualDailyWageUnderground += Number(stat.actualDailyWageUnderground);
    data.employeesNumberSurface += Number(stat.employeesNumberSurface);
    data.employeesNumberUnderground += Number(stat.employeesNumberUnderground);
    
    data.actualDailyWageSummary = data.actualDailyWageSurface + data.actualDailyWageUnderground;
    data.employeesNumberSummary = data.employeesNumberSurface + data.employeesNumberUnderground;
    
    const workingHours = 8; // Varsayılan çalışma saati
    data.workingHoursSurface = data.actualDailyWageSurface * workingHours;
    data.workingHoursUnderground = data.actualDailyWageUnderground * workingHours;
    data.workingHoursSummary = data.workingHoursSurface + data.workingHoursUnderground;
  }

  private initializeMonthlyData(): { [key: string]: any } {
    const monthlyData: { [key: string]: any } = {};
    this.monthNames.forEach((month, index) => {
      const key = (index + 1).toString().padStart(2, '0');
      monthlyData[key] = {
        month,
        actualDailyWageSurface: 0,
        actualDailyWageUnderground: 0,
        actualDailyWageSummary: 0,
        employeesNumberSurface: 0,
        employeesNumberUnderground: 0,
        employeesNumberSummary: 0,
        workingHoursSurface: 0,
        workingHoursUnderground: 0,
        workingHoursSummary: 0,
        lostDayOfWorkSummary: 0,
        accidentSeverityRate: 0,
        year: 0,
      };
    });
    return monthlyData;
  }

  private updateMonthlyData(monthlyData: { [key: string]: any }, accidentStatistics: List_Accident_Statistic[]): void {
    accidentStatistics.forEach((stat) => {
      const monthData = monthlyData[stat.month];
      this.calculateSummaryFields(stat, monthData);
      monthData.lostDayOfWorkSummary += Number(stat.lostDayOfWorkSummary);
    });
  }

  private calculateTotals(monthlyData: { [key: string]: any }): any {
    const totals = {
        month: '', // Burayı boş bırakıyoruz, groupByMonth'da ayarlanacak
        actualDailyWageSurface: 0,
        actualDailyWageUnderground: 0,
        actualDailyWageSummary: 0,
        employeesNumberSurface: 0,
        employeesNumberUnderground: 0,
        employeesNumberSummary: 0,
        workingHoursSurface: 0,
        workingHoursUnderground: 0,
        workingHoursSummary: 0,
        lostDayOfWorkSummary: 0,
        accidentSeverityRate: 0,
    };

    for (const key in monthlyData) {
        if (monthlyData.hasOwnProperty(key)) {
            Object.keys(totals).forEach((field) => {
                totals[field] += monthlyData[key][field];
            });
        }
    }

    if (totals.workingHoursSummary > 0) {
        totals.accidentSeverityRate = (totals.lostDayOfWorkSummary / totals.workingHoursSummary) * 1000;
    }

    return totals;
}

  groupByMonth(accidentStatistics: List_Accident_Statistic[], accidents: List_Accident[]): any[] {
    const monthlyData = this.initializeMonthlyData();
    this.updateMonthlyData(monthlyData, accidentStatistics);

    const accidentRates = this.accidentRateService.groupByMonth(accidents);
    accidentRates.forEach((rate) => {
        const monthIndex = this.monthNames.indexOf(rate.month);
        if (monthIndex !== -1) {
            const monthCode = (monthIndex + 1).toString().padStart(2, '0');
            const monthData = monthlyData[monthCode];
            monthData.lostDayOfWorkSummary = rate.totalLostDayOfWork;

            if (monthData.workingHoursSummary > 0) {
                monthData.accidentSeverityRate = (monthData.lostDayOfWorkSummary / monthData.workingHoursSummary) * 1000;
            }
        }
    });

    const totals = this.calculateTotals(monthlyData);
    totals.month = 'Toplam'; // Toplam satırında sadece "Toplam" yazacak

    const sortedMonthlyData = this.monthNames.map((_, index) => monthlyData[(index + 1).toString().padStart(2, '0')]);
    sortedMonthlyData.push(totals); // Toplamı sona ekle

    return sortedMonthlyData;
}

  groupByYearList(accidentStatistics: List_Accident_Statistic[]): { [year: string]: List_Accident_Statistic[] } {
    return accidentStatistics.reduce((acc, stat) => {
      const year = stat.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push(stat);
      return acc;
    }, {} as { [year: string]: List_Accident_Statistic[] });
  }

  groupByYearChart(
    accidentStatistics: List_Accident_Statistic[],
    accidents: List_Accident[]
  ): { [year: string]: any } {
    const yearlyData = accidentStatistics.reduce((acc, stat) => {
      if (!acc[stat.year]) {
        acc[stat.year] = {
          year: stat.year,
          actualDailyWageSurface: 0,
          actualDailyWageUnderground: 0,
          actualDailyWageSummary: 0,
          employeesNumberSurface: 0,
          employeesNumberUnderground: 0,
          employeesNumberSummary: 0,
          workingHoursSurface: 0,
          workingHoursUnderground: 0,
          workingHoursSummary: 0,
          lostDayOfWorkSummary: 0,
          accidentSeverityRate: 0,
        };
      }

      const yearData = acc[stat.year];
      this.calculateSummaryFields(stat, yearData);
      return acc;
    }, {});

    // Process accidents and add lost days of work to yearly data
    const accidentRates = this.accidentRateService.groupByYearChart(accidents);
    Object.keys(accidentRates).forEach((yearIndex) => {
      const year = accidentRates[yearIndex]?.year;
      if (yearlyData[year]) {
        yearlyData[year].lostDayOfWorkSummary =
          accidentRates[yearIndex].lostDayOfWorkSummary;
      }
    });

    // Calculate accident severity rates for each year
    Object.values(yearlyData).forEach((data: any) => {
      if (data.workingHoursSummary > 0) {
        data.accidentSeverityRate =
          (data.lostDayOfWorkSummary / data.workingHoursSummary) * 1000;
      }
    });

    return yearlyData;
  }

  private getOrCreateDirectorateData(directorateData: { [key: string]: any }, directorate: string, year: string): any[] {
    if (!directorateData[directorate]) {
      directorateData[directorate] = {};
    }
    if (!directorateData[directorate][year]) {
      directorateData[directorate][year] = this.monthNames.map((month, index) => ({
        month,
        actualDailyWageSurface: 0,
        actualDailyWageUnderground: 0,
        actualDailyWageSummary: 0,
        employeesNumberSurface: 0,
        employeesNumberUnderground: 0,
        employeesNumberSummary: 0,
        workingHoursSurface: 0,
        workingHoursUnderground: 0,
        workingHoursSummary: 0,
        lostDayOfWorkSummary: 0,
        accidentSeverityRate: 0,
        year,
      }));
    }
    return directorateData[directorate][year];
  }

  groupByDirectorate(accidentStatistics: List_Accident_Statistic[], accidents: List_Accident[]): any {
    const directorateData: { [key: string]: any } = {};

    accidentStatistics.forEach((stat) => {
      const directorateDataForYear = this.getOrCreateDirectorateData(directorateData, stat.directorate, stat.year);
      const monthIndex = this.monthNames.indexOf(stat.month);
      if (monthIndex !== -1) {
        this.calculateSummaryFields(stat, directorateDataForYear[monthIndex]);
      }
    });

    const accidentRates = this.accidentRateService.groupByDirectorate(accidents);
    Object.keys(accidentRates).forEach((directorate) => {
      Object.keys(accidentRates[directorate]).forEach((year) => {
        const directorateYearData = this.getOrCreateDirectorateData(directorateData, directorate, year);
        const monthIndex = this.monthNames.indexOf(accidentRates[directorate][year].month);
        if (monthIndex !== -1) {
          const monthData = directorateYearData[monthIndex];
          monthData.lostDayOfWorkSummary = accidentRates[directorate][year].lostDayOfWorkSummary;

          if (monthData.workingHoursSummary > 0) {
            monthData.accidentSeverityRate = (monthData.lostDayOfWorkSummary / monthData.workingHoursSummary) * 1000;
          }
        }
      });
    });

    return directorateData;
  }
}
