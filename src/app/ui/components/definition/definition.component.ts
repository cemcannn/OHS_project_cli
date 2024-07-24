import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { ShowAccidentAreaDialogComponent } from 'src/app/dialogs/definition/show-accident-area-dialog/show-accident-area-dialog.component';
import { ShowLimbDialogComponent } from 'src/app/dialogs/definition/show-limb-dialog/show-limb-dialog.component';
import { ShowProfessionDialogComponent } from 'src/app/dialogs/definition/show-profession-dialog/show-profession-dialog.component';
import { ShowTypeOfAccidentDialogComponent } from 'src/app/dialogs/definition/show-type-of-accident-dialog/show-type-of-accident-dialog.component';
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
    const dialogRef = await this.dialog.open(ShowTypeOfAccidentDialogComponent, {
      width: '500px',
      data: accidentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Kaza türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }

  async showLimbDialog(limbData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowLimbDialogComponent, {
      width: '500px',
      data: limbData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Uzuv türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }

  async showProfessionDialog(limbData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowProfessionDialogComponent, {
      width: '500px',
      data: limbData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Meslek türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }

  async showAccidentAreaDialog(limbData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowAccidentAreaDialogComponent, {
      width: '500px',
      data: limbData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Kaza yeri türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }
}