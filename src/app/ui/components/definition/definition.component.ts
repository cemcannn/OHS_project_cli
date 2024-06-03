import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { ShowDefinitionDialogComponent } from 'src/app/dialogs/definition/show-definition-dialog/show-definition-dialog.component';
import { AlertifyService } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class DefinitionComponent extends BaseComponent implements OnInit {
  constructor(
    private alertify: AlertifyService,
    spinner: NgxSpinnerService,
    private dialog: MatDialog) {
    super(spinner);
  }

  ngOnInit(): void {

  }

  async showTypeOfAccidentDialog(accidentData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowDefinitionDialogComponent, {
      width: '500px',
      data: accidentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Kaza türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }
}