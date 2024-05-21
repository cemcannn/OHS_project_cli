import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { List_Personnel } from 'src/app/contracts/personnels/list_personnel'; // Assuming your model location
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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
