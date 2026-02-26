import { Component } from '@angular/core';
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
export class DataImportComponent {

  veri:    ImportState = emptyState();
  yevmiye: ImportState = emptyState();

  constructor(private importService: DataImportService) {}

  onVeriFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.veri.fileName = file?.name ?? null;
  }

  onYevmiyeFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.yevmiye.fileName = file?.name ?? null;
  }

  uploadVeri(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    this.veri = { ...emptyState(), loading: true, fileName: file.name };
    this.importService.importVeri(file).subscribe({
      next:  res  => this.handleResult(this.veri, res),
      error: err  => this.handleError(this.veri, err),
    });
  }

  uploadYevmiye(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    this.yevmiye = { ...emptyState(), loading: true, fileName: file.name };
    this.importService.importYevmiye(file).subscribe({
      next:  res  => this.handleResult(this.yevmiye, res),
      error: err  => this.handleError(this.yevmiye, err),
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
