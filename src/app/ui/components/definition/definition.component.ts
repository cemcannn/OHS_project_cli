import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class DefinitionComponent extends BaseComponent implements OnInit{
  constructor(private alertify: AlertifyService, spinner: NgxSpinnerService) {
    super(spinner);
   }

  ngOnInit(): void {

  }
}