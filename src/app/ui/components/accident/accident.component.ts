import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { DialogService } from 'src/app/services/common/dialog.service';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { ListComponent } from './list/list.component';
import { Create_Accident } from 'src/app/contracts/accidents/create_accident';

@Component({
  selector: 'app-accident',
  templateUrl: './accident.component.html',
  styleUrls: ['./accident.component.scss']
})
export class AccidentComponent extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService, private httpClientService: HttpClientService, private dialogService: DialogService) {
    super(spinner)
  }

  ngOnInit(): void {
  }

  @ViewChild(ListComponent) listComponents: ListComponent;

  // createdAccident(createdAccident: Create_Accident) {
  //   this.listComponents.loadAccidents();
  // }
}