import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { List_Personnel } from 'src/app/contracts/personnels/list_personnel'; // Assuming your model location
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AccidentRate } from 'src/app/contracts/accidents/accident_rate';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumns: string[] = ['month', 'zeroDay', 'oneToFourDay', 'fiveAboveDay', 'deathNumber', 'totalAccidentNumber', 'totalWorkDay'];
  dataSource = null;

  @ViewChild(MatSort) sort: MatSort;

  totalCountPersonnels: number = 0;
  personnels: List_Personnel[] = [];
  totalCountAccidents: number = 0;
  accidents: List_Accident[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private personnelService: PersonnelService,
    private accidentService: AccidentService
  ) {}

  ngOnInit(): void {
    this.getPersonnels();
    this.getAccidents();
  }

  async getPersonnels() {
    this.spinner.show(); // Show spinner while loading

    this.personnelService.getPersonnels().then(
      response => {
        this.totalCountPersonnels = response.totalCount;
        this.personnels = response.datas;
        this.spinner.hide(); // Hide spinner after loading
      },
      error => {
        console.error('Error loading personnels:', error);
        this.spinner.hide(); // Hide spinner in case of error
      }
    );
  }

  async getAccidents() {
    this.spinner.show(); // Show spinner while loading

    this.accidentService.getAccidents().then(
      response => {
        this.totalCountAccidents = response.totalCount;
        this.accidents = response.datas;
        this.spinner.hide(); // Hide spinner after loading
      },
      error => {
        console.error('Error loading personnels:', error);
        this.spinner.hide(); // Hide spinner in case of error
      }
    );
  }
}

// const dataSource: AccidentRate[] = [
//   {month: 'Ocak', zeroDay: 'Helium', weight: 4.0026, symbol: 'He'},
//   {month: 'Şubat', name: 'Helium', weight: 4.0026, symbol: 'He'},
//   {month: 'Mart', name: 'Lithium', weight: 6.941, symbol: 'Li'},
//   {month: 'Nisan', name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//   {month: 'Mayıs', name: 'Boron', weight: 10.811, symbol: 'B'},
//   {month: 'Haziran', name: 'Carbon', weight: 12.0107, symbol: 'C'},
//   {month: 'Temmuz', name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//   {month: 'Ağustos', name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//   {month: 'Eylül', name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//   {month: 'Ekim', name: 'Neon', weight: 20.1797, symbol: 'Ne'},
//   {month: 'Kasım', name: 'Neon', weight: 20.1797, symbol: 'Ne'},
//   {month: 'Aralık', name: 'Neon', weight: 20.1797, symbol: 'Ne'},
// ];

