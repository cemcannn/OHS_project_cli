import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

Chart.register(...registerables);

export interface FrequencyItem {
  rank: number;
  label: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-accident-analysis',
  templateUrl: './accident-analysis.component.html',
  styleUrls: ['./accident-analysis.component.scss']
})
export class AccidentAnalysisComponent extends BaseComponent implements OnInit, OnDestroy {

  allAccidents: List_Accident[] = [];
  filteredAccidents: List_Accident[] = [];

  // Filtreler
  years: string[] = [];
  months = ['Tüm Aylar', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs',
    'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  selectedYear = 'Tüm Yıllar';
  selectedMonth = 'Tüm Aylar';

  // Analiz verileri
  kazaTuruData: FrequencyItem[] = [];
  kazaYeriData: FrequencyItem[] = [];
  sanatData: FrequencyItem[] = [];
  uzuvData: FrequencyItem[] = [];
  monthlyData: FrequencyItem[] = [];
  weekdayData: FrequencyItem[] = [];
  hourData: FrequencyItem[] = [];
  ageData: FrequencyItem[] = [];

  displayedColumns = ['rank', 'label', 'count', 'percentage'];

  private charts = new Map<string, Chart>();
  private readonly MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs',
    'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  private readonly WEEKDAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  constructor(
    spinner: NgxSpinnerService,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService
  ) { super(spinner); }

  ngOnInit(): void {
    this.loadAccidents();
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
  }

  async loadAccidents(): Promise<void> {
    this.showSpinner(SpinnerType.Cog);
    const result = await this.accidentService.getAccidents(
      () => this.hideSpinner(SpinnerType.Cog),
      err => this.alertifyService.message(err, {
        dismissOthers: true, messageType: MessageType.Error, position: Position.TopRight
      })
    );
    this.allAccidents = result.datas;

    const yearSet = new Set(
      this.allAccidents
        .filter(a => a.accidentDate)
        .map(a => new Date(a.accidentDate).getFullYear().toString())
    );
    this.years = ['Tüm Yıllar', ...[...yearSet].sort((a, b) => parseInt(a) - parseInt(b))];

    this.applyFiltersAndAnalyze();
  }

  onFilterChange(): void {
    if (this.selectedYear === 'Tüm Yıllar') {
      this.selectedMonth = 'Tüm Aylar';
    }
    this.applyFiltersAndAnalyze();
  }

  applyFiltersAndAnalyze(): void {
    this.filteredAccidents = this.allAccidents.filter(a => {
      if (!a.accidentDate) return false;
      const d = new Date(a.accidentDate);
      if (this.selectedYear !== 'Tüm Yıllar' && d.getFullYear().toString() !== this.selectedYear) return false;
      if (this.selectedMonth !== 'Tüm Aylar') {
        const idx = this.months.indexOf(this.selectedMonth); // 1=Ocak ... 12=Aralık
        if (d.getMonth() + 1 !== idx) return false;
      }
      return true;
    });

    this.computeAll();
    this.destroyAllCharts();
    setTimeout(() => this.renderAll(), 150);
  }

  onTabChange(): void {
    setTimeout(() => this.renderAll(), 100);
  }

  getTotalCount(): number { return this.filteredAccidents.length; }

  // ─────────────────────────────────────────────
  // HESAPLAMA
  // ─────────────────────────────────────────────

  private computeAll(): void {
    this.kazaTuruData = this.frequency(this.filteredAccidents.map(a => a.typeOfAccident), 20);
    this.kazaYeriData = this.frequency(this.filteredAccidents.map(a => a.accidentArea));
    this.sanatData    = this.frequency(this.filteredAccidents.map(a => a.profession), 20);
    this.uzuvData     = this.frequency(this.filteredAccidents.map(a => a.limb));
    this.monthlyData  = this.monthlyFrequency();
    this.weekdayData  = this.weekdayFrequency();
    this.hourData     = this.hourFrequency();
    this.ageData      = this.ageFrequency();
  }

  private frequency(values: string[], topN?: number): FrequencyItem[] {
    const map = new Map<string, number>();
    values.forEach(v => {
      const key = (v || 'Belirtilmemiş').trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
    const total = values.length || 1;
    let items = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map((e, i) => ({ rank: i + 1, label: e[0], count: e[1], percentage: (e[1] / total) * 100 }));
    return topN ? items.slice(0, topN) : items;
  }

  private monthlyFrequency(): FrequencyItem[] {
    const counts = new Array(12).fill(0);
    this.filteredAccidents.forEach(a => {
      if (a.accidentDate) counts[new Date(a.accidentDate).getMonth()]++;
    });
    const total = this.filteredAccidents.length || 1;
    return this.MONTH_NAMES.map((name, i) => ({
      rank: i + 1, label: name, count: counts[i], percentage: (counts[i] / total) * 100
    }));
  }

  private weekdayFrequency(): FrequencyItem[] {
    const counts = new Array(7).fill(0);
    this.filteredAccidents.forEach(a => {
      if (a.accidentDate) counts[new Date(a.accidentDate).getDay()]++;
    });
    const total = this.filteredAccidents.length || 1;
    // Pazartesi'den başla
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map((d, i) => ({
      rank: i + 1, label: this.WEEKDAY_NAMES[d], count: counts[d], percentage: (counts[d] / total) * 100
    }));
  }

  private hourFrequency(): FrequencyItem[] {
    const bands = [
      '00:00–03:59', '04:00–07:59', '08:00–11:59',
      '12:00–15:59', '16:00–19:59', '20:00–23:59'
    ];
    const counts = new Array(6).fill(0);
    let valid = 0;
    this.filteredAccidents.forEach(a => {
      if (a.accidentHour) {
        const h = parseInt((a.accidentHour || '').split(':')[0], 10);
        if (!isNaN(h) && h >= 0 && h <= 23) { counts[Math.floor(h / 4)]++; valid++; }
      }
    });
    const total = valid || 1;
    return bands.map((band, i) => ({
      rank: i + 1, label: band, count: counts[i], percentage: (counts[i] / total) * 100
    }));
  }

  private ageFrequency(): FrequencyItem[] {
    const labels = ['< 25', '25–29', '30–34', '35–39', '40–44', '45–49', '50–54', '55+'];
    const counts = new Array(8).fill(0);
    let valid = 0;
    this.filteredAccidents.forEach(a => {
      if (a.bornDate) {
        const ref = a.accidentDate ? new Date(a.accidentDate) : new Date();
        const age = ref.getFullYear() - new Date(a.bornDate).getFullYear();
        if      (age < 25) counts[0]++;
        else if (age < 30) counts[1]++;
        else if (age < 35) counts[2]++;
        else if (age < 40) counts[3]++;
        else if (age < 45) counts[4]++;
        else if (age < 50) counts[5]++;
        else if (age < 55) counts[6]++;
        else               counts[7]++;
        valid++;
      }
    });
    const total = valid || 1;
    return labels.map((lbl, i) => ({
      rank: i + 1, label: lbl, count: counts[i], percentage: (counts[i] / total) * 100
    }));
  }

  // ─────────────────────────────────────────────
  // GRAFİK
  // ─────────────────────────────────────────────

  private renderAll(): void {
    this.renderHBar('chartKazaTuru',   this.kazaTuruData,  'Kaza Türü');
    this.renderHBar('chartKazaYeri',   this.kazaYeriData,  'Kaza Yeri');
    this.renderHBar('chartSanat',      this.sanatData,     'Meslek');
    this.renderHBar('chartUzuv',       this.uzuvData,      'Uzuv');
    this.renderVBar('chartMonthly',    this.monthlyData,   'Aylık Dağılım');
    this.renderVBar('chartWeekday',    this.weekdayData,   'Haftanın Günleri');
    this.renderVBar('chartHour',       this.hourData,      'Saat Dağılımı');
    this.renderVBar('chartAge',        this.ageData,       'Yaş Dağılımı');
  }

  private renderHBar(id: string, data: FrequencyItem[], label: string): void {
    this.buildChart(id, data, label, 'y');
  }

  private renderVBar(id: string, data: FrequencyItem[], label: string): void {
    this.buildChart(id, data, label, 'x');
  }

  private buildChart(id: string, data: FrequencyItem[], label: string, axis: 'x' | 'y'): void {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    this.charts.get(id)?.destroy();

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label,
          data: data.map(d => d.count),
          backgroundColor: data.map((_, i) =>
            i === 0 ? 'rgba(192,57,43,0.90)' :
            i < 5   ? 'rgba(192,57,43,0.65)' :
                      'rgba(192,57,43,0.40)'
          ),
          borderColor: 'rgba(192,57,43,0.9)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: axis,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed[axis === 'y' ? 'x' : 'y']} kaza — %${data[ctx.dataIndex]?.percentage.toFixed(1)}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: {
              font: { size: 11 },
              callback: (_val, idx) => {
                const lbl = data[idx]?.label || '';
                return lbl.length > 35 ? lbl.slice(0, 35) + '…' : lbl;
              }
            }
          }
        }
      }
    });
    this.charts.set(id, chart);
  }

  private destroyAllCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts.clear();
  }
}
