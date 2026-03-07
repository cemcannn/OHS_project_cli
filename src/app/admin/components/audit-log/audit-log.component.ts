import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AuditLogDto, AuditLogService } from 'src/app/services/common/models/audit-log.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss'
})
export class AuditLogComponent implements OnInit {
  displayedColumns = ['index', 'userName', 'page', 'action', 'timestamp'];
  dataSource = new MatTableDataSource<AuditLogDto>();
  totalCount = 0;
  pageSize = 20;
  pageIndex = 0;
  searchUser = '';
  loading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private auditLogService: AuditLogService) {}

  async ngOnInit() {
    await this.loadLogs();
  }

  async loadLogs() {
    this.loading = true;
    try {
      const res = await this.auditLogService.getLogs(
        this.pageIndex + 1,
        this.pageSize,
        this.searchUser || undefined
      );
      this.dataSource.data = res.logs;
      this.totalCount = res.totalCount;
    } finally {
      this.loading = false;
    }
  }

  async onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    await this.loadLogs();
  }

  async onSearch() {
    this.pageIndex = 0;
    await this.loadLogs();
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('tr-TR');
  }

  getActionText(action: string): string {
    return action?.split(' — ')[0] ?? '';
  }

  getActionDetails(action: string): string {
    const parts = action?.split(' — ');
    return parts?.length > 1 ? parts[1] : '';
  }

  getActionClass(action: string): string {
    if (!action) return '';
    if (action.includes('ekledi')) return 'chip-add';
    if (action.includes('güncelledi')) return 'chip-update';
    if (action.includes('sildi')) return 'chip-delete';
    if (action.includes('atadı')) return 'chip-assign';
    return 'chip-default';
  }

  getActionIcon(action: string): string {
    if (!action) return 'mdi-check-circle-outline';
    if (action.includes('ekledi')) return 'mdi-plus-circle-outline';
    if (action.includes('güncelledi')) return 'mdi-pencil-outline';
    if (action.includes('sildi')) return 'mdi-trash-can-outline';
    if (action.includes('atadı')) return 'mdi-account-arrow-right-outline';
    return 'mdi-check-circle-outline';
  }

  getPageLabel(requestType: string): { label: string; icon: string } {
    const map: Record<string, { label: string; icon: string }> = {
      'CreateAccidentCommandRequest':           { label: 'Kaza Ekle',          icon: 'mdi-alert-plus-outline' },
      'UpdateAccidentCommandRequest':           { label: 'Kaza Güncelle',      icon: 'mdi-alert-outline' },
      'DeleteAccidentCommandRequest':           { label: 'Kaza Sil',           icon: 'mdi-alert-remove-outline' },
      'CreatePersonnelCommandRequest':          { label: 'Personel Ekle',      icon: 'mdi-account-plus-outline' },
      'UpdatePersonnelCommandRequest':          { label: 'Personel Güncelle',  icon: 'mdi-account-edit-outline' },
      'RemovePersonnelCommandRequest':          { label: 'Personel Sil',       icon: 'mdi-account-remove-outline' },
      'CreateRoleCommandRequest':               { label: 'Rol Ekle',           icon: 'mdi-shield-plus-outline' },
      'UpdateRoleCommandRequest':               { label: 'Rol Güncelle',       icon: 'mdi-shield-edit-outline' },
      'DeleteRoleCommandRequest':               { label: 'Rol Sil',            icon: 'mdi-shield-remove-outline' },
      'AssignRoleEndpointCommandRequest':       { label: 'Yetki Atama',        icon: 'mdi-shield-key-outline' },
      'AssignRoleToUserCommandRequest':         { label: 'Kullanıcı Yetki',    icon: 'mdi-account-key-outline' },
      'UpdateUserCommandRequest':               { label: 'Kullanıcı Güncelle', icon: 'mdi-account-edit-outline' },
      'UpdatePasswordCommandRequest':           { label: 'Şifre Değiştir',     icon: 'mdi-lock-reset' },
      'UploadProfilePhotoCommandRequest':       { label: 'Profil Fotoğrafı',   icon: 'mdi-camera-outline' },
      'CreateAccidentStatisticCommandRequest':  { label: 'İstatistik Ekle',    icon: 'mdi-chart-plus' },
      'UpdateAccidentStatisticCommandRequest':  { label: 'İstatistik Güncelle',icon: 'mdi-chart-line' },
      'DeleteAccidentStatisticCommandRequest':  { label: 'İstatistik Sil',     icon: 'mdi-chart-box-minus-outline' },
    };
    return map[requestType] ?? { label: requestType?.replace('CommandRequest', '') ?? '—', icon: 'mdi-cog-outline' };
  }
}
