import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { DialogService } from 'src/app/services/common/dialog.service';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { ListComponent } from './list/list.component';

@Component({
  selector: 'app-monthly-directorate-data',
  templateUrl: './monthly-directorate-data.component.html',
  styleUrls: ['./monthly-directorate-data.component.scss']
})
export class MonthlyDirectorateDataComponent  extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService, private httpClientService: HttpClientService, private dialogService: DialogService) {
    super(spinner)
  }

  ngOnInit(): void {
  }

  @ViewChild(ListComponent) listComponents: ListComponent;
  
}
