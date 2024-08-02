import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { ListComponent } from './list/list.component';

@Component({
  selector: 'app-accident-rate',
  templateUrl: './accident-rate.component.html',
  styleUrls: ['./accident-rate.component.scss']
})
export class AccidentRateComponent extends BaseComponent implements OnInit {

  constructor(spinner: NgxSpinnerService) {
    super(spinner)
  }

  ngOnInit(): void {
  }

  @ViewChild(ListComponent) listComponents: ListComponent;
}
