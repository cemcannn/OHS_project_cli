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
    const filteredData = this.applyMonthlyFilters();

    if (!filteredData || filteredData.length === 0) {
      const chartConfig: ChartConfiguration = {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Veri Bulunamadı',
              data: [],
              fill: false,
              borderColor: 'rgb(237, 20, 17)',
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };

      if (this.monthlyChart) {
        this.monthlyChart.destroy();
      }

      this.monthlyChart = new Chart(
        this.monthlyChartCanvas.nativeElement,
        chartConfig
      );
      return;
    }

    const months = this.accidentStatisticFilterService.getMonthNames();
    const labels = months.filter((month) =>
      filteredData.some((d: any) => d.month === month)
    );
    const data = labels.map((label) => {
      const monthData = filteredData.find((d: any) => d.month === label);
      return monthData ? monthData[this.selectedMonthlyMetric] || null : null;
    });

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.metrics.find(
              (m) => m.value === this.selectedMonthlyMetric
            ).label,
            data: data,
            fill: false,
            borderColor: 'rgb(237, 20, 17)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(
      this.monthlyChartCanvas.nativeElement,
      chartConfig
    );
  }

  updateYearlyChart() {
    const filteredData = this.applyYearlyFilters();

    const labels = filteredData.map((d: any) => d.year);
    const data = filteredData.map((d: any) => {
      // Sıfır değerleri null ile değiştir
      return d[this.selectedYearlyMetric] || null;
    });

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.metrics.find(
              (m) => m.value === this.selectedYearlyMetric
            ).label,
            data: data,
            fill: false,
            borderColor: 'rgb(237, 20, 17)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    if (this.yearlyChart) {
      this.yearlyChart.destroy();
    }

    this.yearlyChart = new Chart(
      this.yearlyChartCanvas.nativeElement,
      chartConfig
    );
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

    const currentYear = new Date().getFullYear();
    const minYear =
      this.selectedTimeRange === '5'
        ? currentYear - 5
        : this.selectedTimeRange === '10'
        ? currentYear - 10
        : currentYear - 20;

    // Yıllık istatistik verilerini al
    const yearlyStatisticData =
      this.accidentStatisticFilterService.groupByYearChart(
        this.accidentStatistics,
        filters
      ) || [];

    // Yıl aralığına göre filtrele
    return yearlyStatisticData.filter(
      (d: any) => parseInt(d.year) >= minYear && parseInt(d.year) <= currentYear
    );
  }



}
