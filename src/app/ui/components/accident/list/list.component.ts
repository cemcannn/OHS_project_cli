import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx'; // Import xlsx
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
export class ListComponent extends BaseComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['tkiId', 'name', 'surname', 'typeOfAccident', 'limb', 'accidentArea', 'accidentDate', 'accidentHour', 'lostDayOfWork', 'description', 'accidentUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Accident> = new MatTableDataSource<List_Accident>();
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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadAccidents(): Promise<void> {
    this.showSpinner(SpinnerType.Cog);
    const allAccidents : { datas: List_Accident[]; totalCount: number }= await this.accidentService.getAccidents(() => this.hideSpinner(SpinnerType.Cog), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))
    
    this.allAccidents = allAccidents.datas;

    // Dinamik verileri oluştur
    this.years = ['Tüm Yıllar', ...new Set(this.allAccidents.map(accident => new Date(accident.accidentDate).getFullYear().toString()))]; // "Tüm Yıllar" eklendi
    this.years.sort((a, b) => parseInt(a) - parseInt(b));
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
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
  
    // İsim ve soyisim kolonlarını birleştirerek arama
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const combinedName = `${data.name} ${data.surname}`.toLowerCase();
      return combinedName.includes(filter);
    };
  
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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


  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data.map(item => ({
      "TKİ Sicil Numarası": item.tkiId,
      "İsim": item.name,
      "Soyisim": item.surname,
      "Kaza Türü": item.typeOfAccident,
      "Uzuv": item.limb,
      "Kaza Yeri": item.accidentArea,
      "Kaza Tarihi": item.accidentDate,
      "Kaza Saati": item.accidentHour,
      "İş Günü Kaybı": item.lostDayOfWork,
      "Açıklama": item.description
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'İş Kazaları');
    XLSX.writeFile(wb, 'İş Kazaları.xlsx');
  }
}
