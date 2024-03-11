import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-safety',
  templateUrl: './safety.component.html',
  styleUrls: ['./safety.component.scss']
})
export class SafetyComponent extends BaseComponent implements OnInit{
  constructor(private alertify: AlertifyService, spinner: NgxSpinnerService) {
    super(spinner);
   }

  ngOnInit(): void {

  }
}