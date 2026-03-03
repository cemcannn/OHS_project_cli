import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import {
  AlertifyService,
  MessageType,
  Position,
} from 'src/app/services/admin/alertify.service';
import { AccidentStatisticFilterService } from 'src/app/services/common/accident-statistic-filter.service';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent extends BaseComponent implements OnInit {
  @ViewChild('monthlyChart') monthlyChartCanvas: ElementRef;
  @ViewChild('yearlyChart') yearlyChartCanvas: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  monthlyChart: Chart;
  yearlyChart: Chart;

  selectedChartType: string = 'monthly'; // Default olarak Aylık İstatistik Grafiği

  statisticData: any[];

  selectedYearlyMetric: string = 'actualDailyWageSummary';
  selectedYearlyDirectorate: string = 'Tüm İşletmeler';
  selectedTimeRange: string = '5';

  accidents: List_Accident[] = [];

  years: string[] = [];
  directorates: string[] = [];
  accidentStatistics: List_Accident_Statistic[] = [];

  selectedYear: string = 'Tüm Yıllar'; // Filtreleme için seçilen yıl
  selectedMonthlyDirectorate: string = 'Tüm İşletmeler'; // Filtreleme için seçilen işletme
  selectedMonthlyMetric: string = 'actualDailyWageSummary';

  metrics = [
    { value: 'actualDailyWageSummary', label: 'Fiili Yevmiye Sayısı (Toplam)' },
    { value: 'employeesNumberSummary', label: 'Çalışan Sayısı (Toplam)' },
    { value: 'workingHoursSummary', label: 'Çalışma Saati (Toplam)' },
    { value: 'lostDayOfWorkSummary', label: 'İş Günü Kaybı' },
    { value: 'accidentSeverityRate', label: 'Kaza Ağırlık Oranı' },
  ];

  get activeMetricLabel(): string {
    const key = this.selectedChartType === 'monthly'
      ? this.selectedMonthlyMetric
      : this.selectedYearlyMetric;
    return this.metrics.find(m => m.value === key)?.label ?? '';
  }

  constructor(
    spinner: NgxSpinnerService,
    private accidentStatisticService: AccidentStatisticService,
    private alertifyService: AlertifyService,
    private accidentStatisticFilterService: AccidentStatisticFilterService
  ) {
    super(spinner);
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadData();
  }

  private getMaxMonthForMonthlySelection(): number | null {
    const year = this.selectedYear === 'Tüm Yıllar' ? null : this.selectedYear;
    const directorate =
      this.selectedMonthlyDirectorate === 'Tüm İşletmeler'
        ? null
        : this.selectedMonthlyDirectorate;

    let stats = this.accidentStatistics || [];
    if (year) stats = stats.filter((s) => s.year === year);
    if (directorate) stats = stats.filter((s) => s.directorate === directorate);

    const months = stats
      .map((s) => Number(s.month))
      .filter((m) => Number.isFinite(m) && m >= 1 && m <= 12);

    return months.length ? Math.max(...months) : null;
  }

  async loadData() {
    this.showSpinner(SpinnerType.Cog);

    // İstatistikleri yükle
    const result = await this.accidentStatisticService.getAccidentStatistics(
      () => this.hideSpinner(SpinnerType.Cog),
      (errorMessage) =>
        this.alertifyService.message(errorMessage, {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight,
        })
    );

    this.accidentStatistics = result.datas;

    // Yılları ve işletmeleri filtreleme için hazırlıyoruz
    this.years = [
      'Tüm Yıllar',
      ...new Set(this.accidentStatistics.map((stat) => stat.year)),
    ];
    this.years.sort((a, b) => parseInt(a) - parseInt(b));
    this.directorates = [
      'Tüm İşletmeler',
      ...new Set(this.accidentStatistics.map((stat) => stat.directorate)),
    ];

    

      if (this.selectedChartType === 'monthly') {
        this.updateMonthlyChart();
      } else {
        this.updateYearlyChart();
      }
    
  }

updateMonthlyChart() {
  const allMonths = this.accidentStatisticFilterService.getMonthNames(); // 12 ay
  const filteredData = this.applyMonthlyFilters();

  const maxMonth =
    this.selectedYear === 'Tüm Yıllar' ? null : this.getMaxMonthForMonthlySelection();
  const labels = allMonths;

  const data = labels.map((label, idx) => {
    const monthData = filteredData.find((d: any) => d.month === label);
    if (this.selectedYear !== 'Tüm Yıllar' && maxMonth && idx + 1 > maxMonth) {
      return null;
    }
    return monthData ? Number(monthData[this.selectedMonthlyMetric] ?? 0) : 0;
  });

  if (this.monthlyChart) {
    this.monthlyChart.destroy();
  }

  const ctx = this.monthlyChartCanvas.nativeElement.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 420);
  gradient.addColorStop(0, 'rgba(192, 57, 43, 0.30)');
  gradient.addColorStop(0.65, 'rgba(192, 57, 43, 0.06)');
  gradient.addColorStop(1, 'rgba(192, 57, 43, 0.00)');

  const chartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: this.metrics.find(m => m.value === this.selectedMonthlyMetric)?.label,
          data,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#c0392b',
          borderWidth: 2.5,
          tension: 0.4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#c0392b',
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#c0392b',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2.5,
          spanGaps: false,
        } as any,
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 700, easing: 'easeInOutQuart' } as any,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 13, weight: '600' } as any,
            color: '#2c3e50',
            usePointStyle: true,
            pointStyleWidth: 14,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(30, 39, 46, 0.92)',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.82)',
          padding: 12,
          cornerRadius: 8,
          borderColor: '#c0392b',
          borderWidth: 1,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { color: '#7f8c8d', font: { size: 11 } as any },
          border: { color: '#e8e8e8' } as any,
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { color: '#7f8c8d', font: { size: 11 } as any },
          border: { color: '#e8e8e8', dash: [4, 4] } as any,
        },
      },
    },
  };

  this.monthlyChart = new Chart(this.monthlyChartCanvas.nativeElement, chartConfig);
}


  updateYearlyChart() {
    const filteredData = this.applyYearlyFilters();

    const labels = filteredData.map((d: any) => d.year);
    const data = filteredData.map((d: any) => d[this.selectedYearlyMetric] || null);

    if (this.yearlyChart) {
      this.yearlyChart.destroy();
    }

    const ctx = this.yearlyChartCanvas.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 420);
    gradient.addColorStop(0, 'rgba(192, 57, 43, 0.30)');
    gradient.addColorStop(0.65, 'rgba(192, 57, 43, 0.06)');
    gradient.addColorStop(1, 'rgba(192, 57, 43, 0.00)');

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.metrics.find(m => m.value === this.selectedYearlyMetric)?.label,
            data,
            fill: true,
            backgroundColor: gradient,
            borderColor: '#c0392b',
            borderWidth: 2.5,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#c0392b',
            pointBorderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#c0392b',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2.5,
            spanGaps: false,
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 700, easing: 'easeInOutQuart' } as any,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 13, weight: '600' } as any,
              color: '#2c3e50',
              usePointStyle: true,
              pointStyleWidth: 14,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(30, 39, 46, 0.92)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.82)',
            padding: 12,
            cornerRadius: 8,
            borderColor: '#c0392b',
            borderWidth: 1,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { color: '#7f8c8d', font: { size: 11 } as any },
            border: { color: '#e8e8e8' } as any,
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { color: '#7f8c8d', font: { size: 11 } as any },
            border: { color: '#e8e8e8', dash: [4, 4] } as any,
          },
        },
      },
    };

    this.yearlyChart = new Chart(this.yearlyChartCanvas.nativeElement, chartConfig);
  }

  applyMonthlyFilters(): List_Accident_Statistic[] {
    const filters = {
      year: this.selectedYear === 'Tüm Yıllar' ? null : this.selectedYear,
      directorate:
        this.selectedMonthlyDirectorate === 'Tüm İşletmeler'
          ? null
          : this.selectedMonthlyDirectorate,
    };

    const filteredAccidentStatistics =
      this.accidentStatisticFilterService.applyFilters(
        this.accidentStatistics,
        filters
      ) || [];

    return filteredAccidentStatistics;
  }

  applyYearlyFilters(): any[] {

    const filters = {
      directorate:
        this.selectedYearlyDirectorate === 'Tüm İşletmeler'
          ? null
          : this.selectedYearlyDirectorate,
    };

    const range = Number(this.selectedTimeRange) || 5;

    // Yıllık istatistik verilerini al ve yıllara göre sırala
    const yearlyStatisticData =
      this.accidentStatisticFilterService.groupByYearChart(
        this.accidentStatistics,
        filters
      ) || [];

    const sortedByYear = yearlyStatisticData.sort(
      (a: any, b: any) => parseInt(a.year) - parseInt(b.year)
    );

    if (!sortedByYear.length) {
      return [];
    }

    // Grafikte kullanılacak aralık: verideki en güncel yıl üzerinden hesapla
    const maxYear = Math.max(
      ...sortedByYear.map((d: any) => parseInt(d.year) || 0)
    );
    const minYear = maxYear - (range - 1);

    // Yıl aralığına göre filtrele (veri yetersizse tümünü gösterir)
    return sortedByYear.filter((d: any) => {
      const year = parseInt(d.year);
      return !Number.isNaN(year) && year >= minYear;
    });
  }



}
