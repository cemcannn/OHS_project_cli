import { Injectable } from '@angular/core';
import { List_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/list_actual_daily_wage';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  private monthNames: string[] = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  constructor() { }

  groupByMonth(dailyWages: List_Actual_Daily_Wage[]): any[] {
    const monthlyData: { [key: string]: any } = {};

    // Initialize the monthlyData object with all months
    this.monthNames.forEach((month, index) => {
      const key = (index + 1).toString().padStart(2, '0'); // '01', '02', ..., '12'
      monthlyData[key] = {
        month: month,
        actualWageSurface: 0,
        actualWageUnderground: 0,
        employeesNumberSurface: 0,
        employeesNumberUnderground: 0,
        workingHoursSurface: 0,
        workingHoursUnderground: 0,
        workingHoursSummary: 0,
        lostDayOfWorkSummary: 0, // Assuming this is calculated later
      };
    });

    dailyWages.forEach(dailyWage => {
      const month = dailyWage.month;
      const monthData = monthlyData[month];

      monthData.actualWageSurface += Number(dailyWage.actualWageSurface);
      monthData.actualWageUnderground += Number(dailyWage.actualWageUnderground);
      monthData.employeesNumberSurface += Number(dailyWage.employeesNumberSurface);
      monthData.employeesNumberUnderground += Number(dailyWage.employeesNumberUnderground);
      monthData.workingHoursSurface = monthData.actualWageSurface * 8;
      monthData.workingHoursUnderground = monthData.actualWageUnderground * 8;
      monthData.workingHoursSummary = monthData.workingHoursSurface + monthData.workingHoursUnderground;
    });

    // Calculate totals
    const totals = {
      month: 'Toplam',
      actualWageSurface: 0,
      actualWageUnderground: 0,
      employeesNumberSurface: 0,
      employeesNumberUnderground: 0,
      workingHoursSurface: 0,
      workingHoursUnderground: 0,
      workingHoursSummary: 0,
      lostDayOfWorkSummary: 0 // Assuming this is calculated later
    };

    for (const key in monthlyData) {
      if (monthlyData.hasOwnProperty(key)) {
        totals.actualWageSurface += monthlyData[key].actualWageSurface;
        totals.actualWageUnderground += monthlyData[key].actualWageUnderground;
        totals.employeesNumberSurface += monthlyData[key].employeesNumberSurface;
        totals.employeesNumberUnderground += monthlyData[key].employeesNumberUnderground;
        totals.workingHoursSurface += monthlyData[key].workingHoursSurface;
        totals.workingHoursUnderground += monthlyData[key].workingHoursUnderground;
        totals.workingHoursSummary += monthlyData[key].workingHoursSummary;
      }
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
