import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { AccidentRateService } from 'src/app/services/common/accident-rate.service';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { StatisticService } from 'src/app/services/common/statistic.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent extends BaseComponent implements OnInit {
  @ViewChild('monthlyChart') monthlyChartCanvas: ElementRef;
  @ViewChild('yearlyChart') yearlyChartCanvas: ElementRef;
  monthlyChart: Chart;
  yearlyChart: Chart;
  statisticData: any[];
  yearlyStatisticData: any[];
  years: string[] = [];
  directorates: string[] = [];
  selectedYear: string = 'All';
  selectedMonthlyMetric: string = 'actualDailyWageSummary';
  selectedYearlyMetric: string = 'actualDailyWageSummary';
  selectedMonthlyDirectorate: string = 'All';
  selectedYearlyDirectorate: string = 'All';
  selectedTimeRange: string = '5';
  accidents: List_Accident[] = [];
  accidentStatistics: List_Accident_Statistic[] = [];

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
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
    private alertifyService: AlertifyService,
    private statisticService: StatisticService
  ) {
    super(spinner);
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.showSpinner(SpinnerType.Cog);

    try {
      const [accidentStatisticsResponse, accidentsResponse] = await Promise.all(
        [
          this.accidentStatisticService.getAccidentStatistics(),
          this.accidentService.getAccidents(),
        ]
      );

      this.accidentStatistics = accidentStatisticsResponse.datas;
      this.accidents = accidentsResponse.datas;

      this.directorates = [
        ...new Set(this.accidents.map((a) => a.directorate)),
      ];
      this.directorates.unshift('All');

      this.statisticData = this.statisticService.groupByMonth(
        this.accidentStatistics,
        this.accidents
      );
      this.yearlyStatisticData = Object.values(
        this.statisticService.groupByYearChart(
          this.accidentStatistics,
          this.accidents
        )
      );

      // "Toplam" değerini filtrele
      this.statisticData = this.statisticData.filter(
        (d) => d.month !== 'Toplam'
      );

      this.years = [...new Set(this.accidentStatistics.map((dw) => dw.year))];
      this.years.sort((a, b) => parseInt(a) - parseInt(b));
      this.years.unshift('All');

      this.updateMonthlyChart();
      this.updateYearlyChart();

      // İşlemler başarılı olursa buraya eklenebilir
    } catch (errorMessage) {
      this.alertifyService.message(errorMessage, {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight,
      });
    } finally {
      this.hideSpinner(SpinnerType.Cog);
    }
  }

  updateMonthlyChart() {
    const filteredData = this.getMonthlyFilteredData();

    // Eğer veri yoksa, grafiği boş gösterebilirsiniz veya varsayılan değerler kullanabilirsiniz
    if (!filteredData.length) {
      // Örneğin, veri yoksa boş bir grafik oluşturun
      const chartConfig: ChartConfiguration = {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Veri Bulunamadı',
              data: [],
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
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

    const months = this.statisticService.getMonthNames();
    const labels = months.filter((month) =>
      filteredData.some((d) => d.month === month)
    );
    const data = labels.map((label) => {
      const monthData = filteredData.find((d) => d.month === label);
      return monthData ? monthData[this.selectedMonthlyMetric] : 0;
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
            borderColor: 'rgb(75, 192, 192)',
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
    const filteredData = this.getYearlyFilteredData();

    const labels = filteredData.map((d) => d.year);
    const data = filteredData.map((d) => d[this.selectedYearlyMetric]);

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
            borderColor: 'rgb(75, 192, 192)',
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

  getMonthlyFilteredData() {
    let filteredStatistics = this.accidentStatistics;
    let filteredAccidents = this.accidents;

    if (this.selectedYear !== 'All') {
      filteredStatistics = this.statisticService.groupByYearList(
        this.accidentStatistics
      )[this.selectedYear];
      filteredAccidents = this.accidentRateService.groupByYear(this.accidents)[
        this.selectedYear
      ];
    }

    if (this.selectedMonthlyDirectorate !== 'All') {
      filteredStatistics = filteredStatistics.filter(
        (s) => s.directorate === this.selectedMonthlyDirectorate
      );
      filteredAccidents = filteredAccidents.filter(
        (a) => a.directorate === this.selectedMonthlyDirectorate
      );
    }

    const groupedStatistics = this.statisticService.groupByMonth(
      filteredStatistics,
      filteredAccidents
    );

    return groupedStatistics;
  }

  getYearlyFilteredData() {
    const currentYear = new Date().getFullYear();
    const minYear =
      this.selectedTimeRange === '5'
        ? currentYear - 5
        : this.selectedTimeRange === '10'
        ? currentYear - 10
        : currentYear - 20;

        return this.yearlyStatisticData.filter(
      (d) => parseInt(d.year) >= minYear && parseInt(d.year) <= currentYear
    );
  }

  onYearChange() {
    this.updateMonthlyChart();
  }

  onDirectorateChange() {
    this.updateMonthlyChart();
  }

  onMonthlyMetricChange() {
    this.updateMonthlyChart();
  }

  onTimeRangeChange() {
    this.updateYearlyChart();
  }

  onYearlyMetricChange() {
    this.updateYearlyChart();
  }

  onYearlyDirectorateChange() {
    this.updateYearlyChart();
  }
}
