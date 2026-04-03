import { Injectable } from '@angular/core';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { DirectorateService } from './models/directorate.service';

@Injectable({
  providedIn: 'root'
})
export class DirectorateCodeService {
  private loaded = false;
  private byCode = new Map<string, string>();

  constructor(private directorateService: DirectorateService) {}

  async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }

    const result = await this.directorateService.getDirectorates();
    const directorates = result?.datas ?? [];

    this.byCode.clear();
    for (const item of directorates) {
      const codeKey = this.normalize(item.code);
      const name = this.normalize(item.name) ?? item.name;

      if (!name) {
        continue;
      }

      if (codeKey) {
        this.byCode.set(codeKey, name);
      }
    }

    this.loaded = true;
  }

  toDisplay(value?: string | null): string {
    if (!value) {
      return '';
    }

    const key = this.normalize(value);
    if (!key) {
      return value;
    }

    return this.byCode.get(key) ?? value;
  }

  toCodeOrSelf(value?: string | null, selected?: List_Directorate | null): string {
    const selectedCode = this.normalize(selected?.code);
    if (selectedCode) {
      return selectedCode;
    }

    return value ?? '';
  }

  private normalize(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim().toUpperCase();
    return normalized.length > 0 ? normalized : null;
  }
}
