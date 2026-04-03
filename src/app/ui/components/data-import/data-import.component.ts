import { Component, OnInit } from '@angular/core';
import { DirectorateService } from 'src/app/services/common/models/directorate.service';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { DataImportService, ImportResult } from 'src/app/services/common/models/data-import.service';

interface ImportState {
  loading: boolean;
  done: boolean;
  success: boolean | null;
  lines: string[];
  fileName: string | null;
}

function emptyState(): ImportState {
  return { loading: false, done: false, success: null, lines: [], fileName: null };
}

@Component({
  selector: 'app-data-import',
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.scss'],
})
export class DataImportComponent implements OnInit {

  veri:    ImportState = emptyState();
  directorates: List_Directorate[] = [];
  selectedDirectorate = '';
  years: string[] = [];
  selectedYear = '';

  constructor(
    private importService: DataImportService,
    private directorateService: DirectorateService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.directorateService.getDirectorates();
      this.directorates = result.datas ?? [];
      this.syncDirectorateFromFileName(this.veri.fileName);
    } catch (error) {
      this.directorates = [];
      console.error('İşletme listesi yüklenemedi:', error);
    }

    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
      this.years.push(year.toString());
    }
    this.selectedYear = currentYear.toString();
  }

  onVeriFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.veri.fileName = file?.name ?? null;
    this.syncDirectorateFromFileName(this.veri.fileName);
  }

  private syncDirectorateFromFileName(fileName: string | null): void {
    if (!fileName || this.directorates.length === 0) return;

    const normalizedName = this.normalizeText(fileName);
    const aliases: Array<{ alias: string; match: string }> = [
      { alias: 'GLI', match: 'Garp Linyitleri' },
      { alias: 'ELI', match: 'Ege Linyitleri' },
      { alias: 'CLI', match: 'Çan Linyitleri' },
      { alias: 'CLI', match: 'Can Linyitleri' },
      { alias: 'CLI', match: 'Çan Linyitler' },
      { alias: 'CLI', match: 'Can Linyitler' },
      { alias: 'AELI', match: 'Afiş-Elbistan' },
      { alias: 'AELI', match: 'Afis-Elbistan' },
      { alias: 'TKI', match: 'Türkiye Kömür İşletmeleri' },
      { alias: 'TKI', match: 'Turkiye Komur Isletmeleri' },
    ];

    const selectedAlias = aliases.find(item => normalizedName.includes(item.alias));
    if (!selectedAlias) return;

    const directorate = this.directorates.find(item =>
      this.normalizeText(item.name).includes(this.normalizeText(selectedAlias.match))
    );

    if (directorate) {
      this.selectedDirectorate = String(directorate.code || directorate.name);
    }
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  uploadVeri(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file || !this.selectedDirectorate || !this.selectedYear) return;
    this.veri = { ...emptyState(), loading: true, fileName: file.name };
    this.importService.importVeri(file, this.selectedDirectorate, this.selectedYear).subscribe({
      next:  res  => this.handleResult(this.veri, res),
      error: err  => this.handleError(this.veri, err),
    });
  }

  private handleResult(state: ImportState, res: ImportResult): void {
    state.loading = false;
    state.done    = true;
    state.success = res.success;
    state.lines   = res.lines ?? [];
  }

  private handleError(state: ImportState, err: any): void {
    state.loading = false;
    state.done    = true;
    state.success = false;
    state.lines   = [err?.error?.message ?? err?.message ?? 'Sunucu hatası.'];
  }

  lineClass(line: string): string {
    if (line.startsWith('✅') || line.startsWith('TAMAMLANDI')) return 'line-success';
    if (line.startsWith('❌') || line.startsWith('HATA')) return 'line-error';
    if (line.startsWith('⚠️')) return 'line-warn';
    if (line.startsWith('🚀') || line.startsWith('📂') || line.startsWith('📖') || line.startsWith('🔌')) return 'line-info';
    if (line.startsWith('   ...')) return 'line-progress';
    if (line.startsWith('─')) return 'line-divider';
    return '';
  }
}
