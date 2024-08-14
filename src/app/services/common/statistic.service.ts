import { Injectable } from '@angular/core';
import { AccidentRateService } from './accident-rate.service';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  private monthNames: string[] = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  constructor(private accidentRateService: AccidentRateService) { }

  getMonthNames(): string[] {
    return this.monthNames;
  }

  groupByMonth(accidentStatistics: List_Accident_Statistic[], accidents: List_Accident[]): any[] {
    const monthlyData: { [key: string]: any } = {};

    // Initialize the monthlyData object with all months
    this.monthNames.forEach((month, index) => {
      const key = (index + 1).toString().padStart(2, '0'); // '01', '02', ..., '12'
      monthlyData[key] = {
        month: month,
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

    // Process daily wages
    accidentStatistics.forEach(accidentStatistic => {
      const monthCode = accidentStatistic.month;
      const monthData = monthlyData[monthCode];

      monthData.actualDailyWageSurface += Number(accidentStatistic.actualDailyWageSurface);
      monthData.actualDailyWageUnderground += Number(accidentStatistic.actualDailyWageUnderground);
      monthData.actualDailyWageSummary = monthData.actualDailyWageSurface + monthData.actualDailyWageUnderground;
      monthData.employeesNumberSurface += Number(accidentStatistic.employeesNumberSurface);
      monthData.employeesNumberUnderground += Number(accidentStatistic.employeesNumberUnderground);
      monthData.employeesNumberSummary = monthData.employeesNumberSurface + monthData.employeesNumberUnderground;
      monthData.workingHoursSurface = monthData.actualDailyWageSurface * 8;
      monthData.workingHoursUnderground = monthData.actualDailyWageUnderground * 8;
      monthData.workingHoursSummary = monthData.workingHoursSurface + monthData.workingHoursUnderground;
      monthData.lostDayOfWorkSummary += Number(accidentStatistic.lostDayOfWorkSummary);
    });

    // Process accidents
    const accidentRates = this.accidentRateService.groupByMonth(accidents);
    accidentRates.forEach(rate => {
      const monthIndex = this.monthNames.indexOf(rate.month);
      if (monthIndex !== -1) {
        const monthCode = (monthIndex + 1).toString().padStart(2, '0');
        const monthData = monthlyData[monthCode];

        monthData.lostDayOfWorkSummary = rate.totalLostDayOfWork;

        // Calculate accident severity rate
        if (monthData.workingHoursSummary > 0) {
          monthData.accidentSeverityRate =
            (monthData.lostDayOfWorkSummary / monthData.workingHoursSummary) * 1000;
        }
      }
    });

    // Calculate totals
    const totals = {
      month: 'Toplam',
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
        totals.actualDailyWageSurface += monthlyData[key].actualDailyWageSurface;
        totals.actualDailyWageUnderground += monthlyData[key].actualDailyWageUnderground;
        totals.actualDailyWageSummary = totals.actualDailyWageSurface + totals.actualDailyWageUnderground;
        totals.employeesNumberSurface += monthlyData[key].employeesNumberSurface;
        totals.employeesNumberUnderground += monthlyData[key].employeesNumberUnderground;
        totals.employeesNumberSummary = totals.employeesNumberSurface + totals.employeesNumberUnderground;
        totals.workingHoursSurface += monthlyData[key].workingHoursSurface;
        totals.workingHoursUnderground += monthlyData[key].workingHoursUnderground;
        totals.workingHoursSummary += monthlyData[key].workingHoursSummary;
        totals.lostDayOfWorkSummary += monthlyData[key].lostDayOfWorkSummary;
      }
    }

    // Calculate total accident severity rate
    if (totals.workingHoursSummary > 0) {
      totals.accidentSeverityRate = (totals.lostDayOfWorkSummary / totals.workingHoursSummary) * 1000;
    }
console.log(monthlyData)
    // Return the sorted monthly data and totals
    return [...this.monthNames.map((_, index) => monthlyData[(index + 1).toString().padStart(2, '0')]), totals];
  }


  groupByYearList(accidentStatistics: List_Accident_Statistic[]): { [year: string]: List_Accident_Statistic[] } {
    return accidentStatistics.reduce((acc, accidentStatistic) => {
      const year = accidentStatistic.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(accidentStatistic);
      return acc;
    }, {} as { [year: string]: List_Accident_Statistic[] });
  }

  groupByYearChart(accidentStatistics: List_Accident_Statistic[], accidents: List_Accident[]): { [year: string]: any } {
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
          accidentSeverityRate: 0
        };
      }

      const yearData = acc[stat.year];

      yearData.actualDailyWageSurface += Number(stat.actualDailyWageSurface);
      yearData.actualDailyWageUnderground += Number(stat.actualDailyWageUnderground);
      yearData.actualDailyWageSummary = yearData.actualDailyWageSurface + yearData.actualDailyWageUnderground;
      yearData.employeesNumberSurface += Number(stat.employeesNumberSurface);
      yearData.employeesNumberUnderground += Number(stat.employeesNumberUnderground);
      yearData.employeesNumberSummary = yearData.employeesNumberSurface + yearData.employeesNumberUnderground;
      yearData.workingHoursSurface = yearData.actualDailyWageSurface * 8;
      yearData.workingHoursUnderground = yearData.actualDailyWageUnderground * 8;
      yearData.workingHoursSummary = yearData.workingHoursSurface + yearData.workingHoursUnderground;

      return acc;
    }, {});

    // Process accidents and add lost days of work to yearly data
    const accidentRates = this.accidentRateService.groupByYearChart(accidents);
    Object.keys(accidentRates).forEach((yearIndex) => {
      const year = accidentRates[yearIndex]?.year; // accidentRates içindeki gerçek yıl bilgisini alın
      if (yearlyData[year]) {
        yearlyData[year].lostDayOfWorkSummary = accidentRates[yearIndex].lostDayOfWorkSummary;
      }
    });

    // Calculate accident severity rates for each year
    Object.values(yearlyData).forEach((data: any) => {
      if (data.workingHoursSummary > 0) {
        data.accidentSeverityRate = (data.lostDayOfWorkSummary / data.workingHoursSummary) * 1000;
      }
    });

    return yearlyData;
  }
}
