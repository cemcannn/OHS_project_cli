import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { StatisticService } from 'src/app/services/common/statistic.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @ViewChild('monthlyChart') monthlyChartCanvas: ElementRef;
  @ViewChild('yearlyChart') yearlyChartCanvas: ElementRef;
  monthlyChart: Chart;
  yearlyChart: Chart;
  statisticData: any[];
  years: string[] = [];
  selectedYear: string = 'All';
  selectedMonthlyMetric: string = 'actualDailyWageSummary';
  selectedYearlyMetric: string = 'actualDailyWageSummary';
  selectedTimeRange: string = '5';

  metrics = [
    { value: 'actualDailyWageSummary', label: 'Fiili Yevmiye Sayısı (Toplam)' },
    { value: 'employeesNumberSummary', label: 'Çalışan Sayısı (Toplam)' },
    { value: 'workingHoursSummary', label: 'Çalışma Saati (Toplam)' },
    { value: 'lostDayOfWorkSummary', label: 'İş Günü Kaybı' },
    { value: 'accidentSeverityRate', label: 'Kaza Ağırlık Oranı' }
  ];

  constructor(
    private accidentStatisticService: AccidentStatisticService,
    private accidentService: AccidentService,
    private statisticService: StatisticService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    const [dailyWagesResponse, accidentsResponse] = await Promise.all([
      this.accidentStatisticService.getAccidentStatistics(),
      this.accidentService.getAccidents()
    ]);

    const dailyWages = dailyWagesResponse.datas;
    const accidents = accidentsResponse.datas;

    this.statisticData = this.statisticService.groupByMonth(dailyWages, accidents);

    // "Toplam" değerini filtrele
    this.statisticData = this.statisticData.filter(d => d.month !== 'Toplam');

    this.years = [...new Set(dailyWages.map(dw => dw.year))];
    this.years.sort((a, b) => parseInt(a) - parseInt(b));
    this.years.unshift('All');

    this.updateMonthlyChart();
    this.updateYearlyChart();
  }

  updateMonthlyChart() {
    const filteredData = this.getMonthlyFilteredData();

    const months = this.statisticService.getMonthNames();
    const labels = months.filter(month => filteredData.some(d => d.month === month));
    const data = labels.map(label => {
      const monthData = filteredData.find(d => d.month === label);
      return monthData ? monthData[this.selectedMonthlyMetric] : 0;
    });

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: this.metrics.find(m => m.value === this.selectedMonthlyMetric).label,
          data: data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    this.monthlyChart = new Chart(this.monthlyChartCanvas.nativeElement, chartConfig);
  }

  updateYearlyChart() {
    const filteredData = this.getYearlyFilteredData();

    const labels = filteredData.map(d => d.year);
    const data = filteredData.map(d => d[this.selectedYearlyMetric]);

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: this.metrics.find(m => m.value === this.selectedYearlyMetric).label,
          data: data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    if (this.yearlyChart) {
      this.yearlyChart.destroy();
    }

    this.yearlyChart = new Chart(this.yearlyChartCanvas.nativeElement, chartConfig);
  }

  getMonthlyFilteredData() {
    let filteredData = this.statisticData;

    if (this.selectedYear !== 'All') {
      filteredData = filteredData.filter(d => d.year === this.selectedYear);
    }

    return filteredData;
  }

  getYearlyFilteredData() {
    const currentYear = new Date().getFullYear();
    const minYear = this.selectedTimeRange === '5' ? currentYear - 5 :
                    this.selectedTimeRange === '10' ? currentYear - 10 : currentYear - 20;

    return this.statisticData.filter(d => parseInt(d.year) >= minYear && parseInt(d.year) <= currentYear);
  }

  onYearChange() {
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
}
