import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { ListComponent } from './list/list.component';

@Component({
  selector: 'app-actual-daily-wage',
  templateUrl: './actual-daily-wage.component.html',
  styleUrls: ['./actual-daily-wage.component.scss']
})
export class ActualDailyWageComponent extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService) {
    super(spinner)
  }

  ngOnInit(): void {
  }

  @ViewChild(ListComponent) listComponents: ListComponent;
}
