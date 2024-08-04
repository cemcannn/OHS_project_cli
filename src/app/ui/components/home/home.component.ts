import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { StatisticService } from 'src/app/services/common/statistic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('chart') chartCanvas: ElementRef;
  chart: Chart;
  statisticData: any[];
  years: string[] = [];
  selectedYear: string = 'All';
  selectedMetric: string = 'actualDailyWageSummary';

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
    this.years.unshift('All');

    this.updateChart();
  }

  updateChart() {
    const filteredData = this.selectedYear === 'All' 
      ? this.statisticData 
      : this.statisticData.filter(d => d.year === this.selectedYear);

    const labels = filteredData.map(d => d.month);
    const data = filteredData.map(d => d[this.selectedMetric]);

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: this.metrics.find(m => m.value === this.selectedMetric).label,
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

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, chartConfig);
  }

  onYearChange() {
    this.updateChart();
  }

  onMetricChange() {
    this.updateChart();
  }
}
