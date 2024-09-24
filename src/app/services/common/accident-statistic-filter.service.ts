import { Injectable } from '@angular/core';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';

@Injectable({
  providedIn: 'root',
})
export class AccidentStatisticFilterService {
  private monthNames: string[] = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  constructor() {}

  getMonthNames(): string[] {
    return this.monthNames;
  }

  private initializeStatistic<T extends Partial<List_Accident_Statistic>>(
    overrides: T = {} as T
  ): List_Accident_Statistic & T {
    return {
      month: '',
      year: '0',
      directorate: '0',
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
      ...overrides,
    };
  }

  private updateStatistic(
    stat: List_Accident_Statistic,
    statistic: List_Accident_Statistic
  ): void {
    statistic.actualDailyWageSurface = (
      Number(statistic.actualDailyWageSurface) +
      Number(stat.actualDailyWageSurface)
    ).toString();
    statistic.actualDailyWageUnderground = (
      Number(statistic.actualDailyWageUnderground) +
      Number(stat.actualDailyWageUnderground)
    ).toString();
    statistic.actualDailyWageSummary = (
      Number(statistic.actualDailyWageSurface) +
      Number(statistic.actualDailyWageUnderground)
    ).toString();

    statistic.employeesNumberSurface = (
      Number(statistic.employeesNumberSurface) +
      Number(stat.employeesNumberSurface)
    ).toString();
    statistic.employeesNumberUnderground = (
      Number(statistic.employeesNumberUnderground) +
      Number(stat.employeesNumberUnderground)
    ).toString();
    statistic.employeesNumberSummary = (
      Number(statistic.employeesNumberSurface) +
      Number(statistic.employeesNumberUnderground)
    ).toString();

    const workingHours = 8;
    statistic.workingHoursSurface = (
      Number(statistic.actualDailyWageSurface) * workingHours
    ).toString();
    statistic.workingHoursUnderground = (
      Number(statistic.actualDailyWageUnderground) * workingHours
    ).toString();
    statistic.workingHoursSummary = (
      Number(statistic.workingHoursSurface) +
      Number(statistic.workingHoursUnderground)
    ).toString();

    statistic.lostDayOfWorkSummary = (
      Number(statistic.lostDayOfWorkSummary) + Number(stat.lostDayOfWorkSummary)
    ).toString();

    statistic.accidentSeverityRate = (
      (Number(statistic.lostDayOfWorkSummary) /
        Number(statistic.workingHoursSummary)) *
      1000
    ).toString();
  }

  calculateTotals(
    accidentStatistics: List_Accident_Statistic[]
  ): List_Accident_Statistic[] {
    // Aylık istatistikleri saklamak için boş bir nesne başlatıyoruz
    const statistics: { [month: string]: List_Accident_Statistic } = {};
    this.monthNames.forEach((month) => {
      // Her ay için initializeStatistic kullanarak veri başlatıyoruz
      statistics[month] = this.initializeStatistic({ month });
    });

    accidentStatistics.forEach((stat) => {
      const monthIndex = Number(stat.month) - 1;
      const month = this.monthNames[monthIndex];
      this.updateStatistic(stat, statistics[month]); // Aylık verilere güncelleme yapılıyor
    });

    // Toplam istatistik için initializeStatistic kullanıyoruz
    const totals = this.initializeStatistic({ month: 'Toplam' });

    // Her ayın verilerini toplam veriyle topluyoruz
    Object.values(statistics).forEach((stat) => {
      totals.actualDailyWageSurface = (
        Number(totals.actualDailyWageSurface) +
        Number(stat.actualDailyWageSurface)
      ).toString();
      totals.actualDailyWageUnderground = (
        Number(totals.actualDailyWageUnderground) +
        Number(stat.actualDailyWageUnderground)
      ).toString();
      totals.actualDailyWageSummary = (
        Number(totals.actualDailyWageSummary) +
        Number(stat.actualDailyWageSummary)
      ).toString();
      totals.employeesNumberSurface = (
        Number(totals.employeesNumberSurface) +
        Number(stat.employeesNumberSurface)
      ).toString();
      totals.employeesNumberUnderground = (
        Number(totals.employeesNumberUnderground) +
        Number(stat.employeesNumberUnderground)
      ).toString();
      totals.employeesNumberSummary = (
        Number(totals.employeesNumberSummary) +
        Number(stat.employeesNumberSummary)
      ).toString();
      totals.workingHoursSurface = (
        Number(totals.workingHoursSurface) + Number(stat.workingHoursSurface)
      ).toString();
      totals.workingHoursUnderground = (
        Number(totals.workingHoursUnderground) +
        Number(stat.workingHoursUnderground)
      ).toString();
      totals.workingHoursSummary = (
        Number(totals.workingHoursSummary) + Number(stat.workingHoursSummary)
      ).toString();
      totals.lostDayOfWorkSummary = (
        Number(totals.lostDayOfWorkSummary) + Number(stat.lostDayOfWorkSummary)
      ).toString();
    });

    if (Number(totals.workingHoursSummary) > 0) {
      totals.accidentSeverityRate = (
        (Number(totals.lostDayOfWorkSummary) /
          Number(totals.workingHoursSummary)) *
        1000
      ).toString();
    }

    return [...Object.values(statistics), totals];
  }

  // Yıl bazında filtreleme ve toplam hesaplama
  filterByYear(
    accidentStatistics: List_Accident_Statistic[],
    year: string
  ): List_Accident_Statistic[] {
    const filteredAccidentStatistics = accidentStatistics.filter(
      (statistic) => statistic.year === year
    );
    return this.calculateTotals(filteredAccidentStatistics);
  }

  // İşletme bazında filtreleme ve toplam hesaplama
  filterByDirectorate(
    accidentStatistics: List_Accident_Statistic[],
    directorate: string
  ): List_Accident_Statistic[] {
    const filteredAccidentStatistics = accidentStatistics.filter(
      (statistic) => statistic.directorate === directorate
    );
    return this.calculateTotals(filteredAccidentStatistics);
  }

  // Çoklu filtreleme işlemi
  applyFilters(
    accidentStatistics: List_Accident_Statistic[],
    filters: any
  ): List_Accident_Statistic[] {
    let filteredAccidentStatistics = accidentStatistics;

    if (filters.year) {
      filteredAccidentStatistics = filteredAccidentStatistics.filter(
        (statistic) => statistic.year === filters.year
      );
    }

    if (filters.directorate) {
      filteredAccidentStatistics = filteredAccidentStatistics.filter(
        (statistic) => statistic.directorate === filters.directorate
      );
    }

    return this.calculateTotals(filteredAccidentStatistics);
  }

  groupByYearChart(
    accidentStatistics: List_Accident_Statistic[], filters: any): List_Accident_Statistic[] {
    // İşletme filtresi uygula
    if (filters.directorate) {
      accidentStatistics = accidentStatistics.filter(
        (stat) => stat.directorate === filters.directorate
      );
    }

    const yearlyData = accidentStatistics.reduce((acc, stat) => {
      if (!acc[stat.year]) {
        acc[stat.year] = this.initializeStatistic({ year: stat.year });
      }

      const yearData = acc[stat.year];
      this.updateStatistic(stat, yearData);
      return acc;
    }, {} as { [year: string]: List_Accident_Statistic });

    Object.values(yearlyData).forEach((data: any) => {
      if (Number(data.workingHoursSummary) > 0) {
        data.accidentSeverityRate =
          (Number(data.lostDayOfWorkSummary) /
            Number(data.workingHoursSummary)) *
          1000;
      }
    });
    return Object.values(yearlyData);
  }
}
