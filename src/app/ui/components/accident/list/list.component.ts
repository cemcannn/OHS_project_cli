import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { AccidentUpdateDialogComponent } from 'src/app/dialogs/accident/accident-update-dialog/accident-update-dialog.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentFilterService } from 'src/app/services/common/accident-filter.service';
import { AccidentService } from 'src/app/services/common/models/accident.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  displayedColumns: string[] = ['tkiId', 'name', 'surname', 'typeOfAccident', 'limb', 'accidentArea', 'accidentDate', 'accidentHour', 'lostDayOfWork', 'description', 'accidentUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Accident> = null;
  allAccidents: List_Accident[] = [];
  monthNames = ['Tüm Aylar', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']; // "Tüm Aylar" eklendi
  years: string[] = [];
  directorates: string[] = [];

  selectedMonth: string = 'Tüm Aylar';
  selectedYear: string = 'Tüm Yıllar';
  selectedDirectorate: string = 'Tüm İşletmeler';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    spinner: NgxSpinnerService,
    private accidentService: AccidentService,
    private accidentFilterService: AccidentFilterService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog,
  ) {
    super(spinner);
  }

  async pageChanged() {
    await this.loadAccidents();
  }

  async ngOnInit() {
    await this.loadAccidents();
  }

  async openUpdateAccidentDialog(accidentData: any): Promise<void> {
    const dialogRef = await this.dialog.open(AccidentUpdateDialogComponent, {
      width: '500px',
      data: accidentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Accident updated successfully!');
        this.loadAccidents(); // Refresh the list after update
      } else if (result && result.error) {
        console.error('Failed to update accident:', result.error);
      }
    });
  }


  async loadAccidents(): Promise<void> {
    // Kazaları yükle
    const result = await this.accidentService.getAccidents();
    this.allAccidents = result.datas;

    // Dinamik verileri oluştur
    this.years = ['Tüm Yıllar', ...new Set(this.allAccidents.map(accident => new Date(accident.accidentDate).getFullYear().toString()))]; // "Tüm Yıllar" eklendi
    this.directorates = ['Tüm İşletmeler', ...new Set(this.allAccidents.map(accident => accident.directorate))]; // "Tüm İşletmeler" eklendi

    this.applyFilters();
  }

  applyFilters(): void {
    const filters = {
      month: this.selectedMonth === 'Tüm Aylar' ? null : this.selectedMonth,
      year: this.selectedYear === 'Tüm Yıllar' ? null : this.selectedYear,
      directorate: this.selectedDirectorate === 'Tüm İşletmeler' ? null : this.selectedDirectorate
    };

    const filteredAccidents = this.accidentFilterService.applyFilters(this.allAccidents, filters);
    this.dataSource = new MatTableDataSource<List_Accident>(filteredAccidents);

    // Paginator ve Sort'u dataSource'a bağla
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
