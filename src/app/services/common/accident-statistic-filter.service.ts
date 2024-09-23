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

  private getMonthNames(): string[] {
    return this.monthNames;
  }

  private initializeStatistic(month: string = ''): List_Accident_Statistic {
    return {    
      month,
      year: '',
      directorate: '',
      actualDailyWageSurface: '0',
      actualDailyWageUnderground: '0',
      actualDailyWageSummary: '0',
      employeesNumberSurface: '0',
      employeesNumberUnderground: '0',
      employeesNumberSummary: '0',
      workingHoursSurface: '0',
      workingHoursUnderground: '0',
      workingHoursSummary: '0',
      lostDayOfWorkSummary: '0',
      lostDayOfWorkSurface: '0',
      lostDayOfWorkUnderground: '0',
      accidentSeverityRate: '0',
      accidentFrequencyRate: '0',
    };
  }

  private updateStatistic(stat: List_Accident_Statistic, statistic: List_Accident_Statistic): void {
    statistic.actualDailyWageSurface = (Number(statistic.actualDailyWageSurface) + Number(stat.actualDailyWageSurface)).toString();
    statistic.actualDailyWageUnderground = (Number(statistic.actualDailyWageUnderground) + Number(stat.actualDailyWageUnderground)).toString();
    statistic.employeesNumberSurface = (Number(statistic.employeesNumberSurface) + Number(stat.employeesNumberSurface)).toString();
    statistic.employeesNumberUnderground = (Number(statistic.employeesNumberUnderground) + Number(stat.employeesNumberUnderground)).toString();
    statistic.actualDailyWageSummary = (Number(statistic.actualDailyWageSurface) + Number(statistic.actualDailyWageUnderground)).toString();
    statistic.employeesNumberSummary = (Number(statistic.employeesNumberSurface) + Number(statistic.employeesNumberUnderground)).toString();
    
    const workingHours = 8;
    statistic.workingHoursSurface = (Number(statistic.actualDailyWageSurface) * workingHours).toString();
    statistic.workingHoursUnderground = (Number(statistic.actualDailyWageUnderground) * workingHours).toString();
    statistic.workingHoursSummary = (Number(statistic.workingHoursSurface) + Number(statistic.workingHoursUnderground)).toString();

    statistic.lostDayOfWorkSummary = (Number(statistic.lostDayOfWorkSummary) + Number(stat.lostDayOfWorkSummary)).toString();
  }

  calculateTotals(accidentStatistics: List_Accident_Statistic[]): List_Accident_Statistic[] {
    const statistics: { [month: string]: List_Accident_Statistic } = {};
    this.monthNames.forEach(month => statistics[month] = this.initializeStatistic(month));

    accidentStatistics.forEach(stat => {
      const month = this.monthNames[stat.month];
      this.updateStatistic(stat, statistics[month]);
    });

    const totals = this.initializeStatistic('Toplam');
    Object.values(statistics).forEach(stat => {
      this.updateStatistic(stat, totals);
    });

    if (Number(totals.workingHoursSummary) > 0) {
      totals.accidentSeverityRate = ((Number(totals.lostDayOfWorkSummary) / Number(totals.workingHoursSummary)) * 1000).toString();
    }

    return [...Object.values(statistics), totals];
  }

  // Yıl bazında filtreleme ve toplam hesaplama
  filterByYear(accidentStatistics: List_Accident_Statistic[], year: string): List_Accident_Statistic[] {
    const filteredAccidentStatistics = accidentStatistics.filter(statistic => statistic.year === year);
    return this.calculateTotals(filteredAccidentStatistics);
  }

  // İşletme bazında filtreleme ve toplam hesaplama
  filterByDirectorate(accidentStatistics: List_Accident_Statistic[], directorate: string): List_Accident_Statistic[] {
    const filteredAccidentStatistics = accidentStatistics.filter(statistic => statistic.directorate === directorate);
    return this.calculateTotals(filteredAccidentStatistics);
  }

  // Çoklu filtreleme işlemi
  applyFilters(accidentStatistics: List_Accident_Statistic[], filters: any): List_Accident_Statistic[] {
    let filteredAccidentStatistics = accidentStatistics;

    if (filters.year) {
      filteredAccidentStatistics = filteredAccidentStatistics.filter(statistic => statistic.year === filters.year);
    }

    if (filters.directorate) {
      filteredAccidentStatistics = filteredAccidentStatistics.filter(statistic => statistic.directorate === filters.directorate);
    }

    return this.calculateTotals(filteredAccidentStatistics);
  }

  groupByYearChart(accidentStatistics: List_Accident_Statistic[]): { [year: string]: any } {
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
      this.updateStatistic(stat, yearData); // Yıl verilerini toplamak için
      return acc;
    }, {});
  
    // Her yıl için kaza şiddet oranlarını hesaplayalım
    Object.values(yearlyData).forEach((data: any) => {
      if (data.workingHoursSummary > 0) {
        data.accidentSeverityRate =
          (data.lostDayOfWorkSummary / data.workingHoursSummary) * 1000;
      }
    });
  
    return yearlyData;
  }
}
