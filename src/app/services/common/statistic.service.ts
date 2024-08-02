import { Injectable } from '@angular/core';
import { List_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/list_actual_daily_wage';
import { AccidentRateService } from './accident-rate.service';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];


  constructor(private accidentRateService: AccidentRateService) { }

  groupByMonth(dailyWages: List_Actual_Daily_Wage[], accidents: List_Accident[]): any[] {
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
        accidentSeverityRate: 0
      };
    });

    // Process daily wages
    dailyWages.forEach(dailyWage => {
      const monthCode = dailyWage.month;
      const monthData = monthlyData[monthCode];

      monthData.actualDailyWageSurface += Number(dailyWage.actualDailyWageSurface);
      monthData.actualDailyWageUnderground += Number(dailyWage.actualDailyWageUnderground);
      monthData.actualDailyWageSummary = monthData.actualDailyWageSurface + monthData.actualDailyWageUnderground;
      monthData.employeesNumberSurface += Number(dailyWage.employeesNumberSurface);
      monthData.employeesNumberUnderground += Number(dailyWage.employeesNumberUnderground);
      monthData.employeesNumberSummary = monthData.employeesNumberSurface + monthData.employeesNumberUnderground;
      monthData.workingHoursSurface = monthData.actualDailyWageSurface * 8;
      monthData.workingHoursUnderground = monthData.actualDailyWageUnderground * 8;
      monthData.workingHoursSummary = monthData.workingHoursSurface + monthData.workingHoursUnderground;
    });

    // Process accidents
    const accidentRates = this.accidentRateService.groupByMonth(accidents);
    accidentRates.forEach(rate => {
      const monthIndex = this.monthNames.indexOf(rate.month);
      if (monthIndex !== -1) {
        const monthCode = (monthIndex + 1).toString().padStart(2, '0');
        monthlyData[monthCode].lostDayOfWorkSummary = rate.totalLostDayOfWork;

        // Calculate accident severity rate
        if (monthlyData[monthCode].workingHoursSummary > 0) {
          monthlyData[monthCode].accidentSeverityRate =
            (monthlyData[monthCode].lostDayOfWorkSummary / monthlyData[monthCode].workingHoursSummary) * 1000;
        }
      }
    });

    // Calculate totals
    const totals = {
      month: 'Toplam',
      actualDailyWageSurface: 0,
      actualDailyWageUnderground: 0,
      employeesNumberSurface: 0,
      employeesNumberUnderground: 0,
      workingHoursSurface: 0,
      workingHoursUnderground: 0,
      workingHoursSummary: 0,
      lostDayOfWorkSummary: 0,
      accidentSeverityRate: 0
    };

    for (const key in monthlyData) {
      if (monthlyData.hasOwnProperty(key)) {
        totals.actualDailyWageSurface += monthlyData[key].actualDailyWageSurface;
        totals.actualDailyWageUnderground += monthlyData[key].actualDailyWageUnderground;
        totals.employeesNumberSurface += monthlyData[key].employeesNumberSurface;
        totals.employeesNumberUnderground += monthlyData[key].employeesNumberUnderground;
        totals.workingHoursSurface += monthlyData[key].workingHoursSurface;
        totals.workingHoursUnderground += monthlyData[key].workingHoursUnderground;
        totals.workingHoursSummary += monthlyData[key].workingHoursSummary;
      }
    }

    // Calculate total accident severity rate
    if (totals.workingHoursSummary > 0) {
      totals.accidentSeverityRate = (totals.lostDayOfWorkSummary / totals.workingHoursSummary) * 1000;
    }

    return [...Object.values(monthlyData), totals];
  }

  groupByYear(dailyWages: List_Actual_Daily_Wage[]): { [year: string]: List_Actual_Daily_Wage[] } {
    return dailyWages.reduce((acc, dailyWage) => {
      const year = dailyWage.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(dailyWage);
      return acc;
    }, {} as { [year: string]: List_Actual_Daily_Wage[] });
  }
}
