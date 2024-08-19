import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { ShowAccidentAreaDialogComponent } from 'src/app/dialogs/definition/show-accident-area-dialog/show-accident-area-dialog.component';
import { ShowDirectorateDialogComponent } from 'src/app/dialogs/definition/show-directorate-dialog/show-directorate-dialog.component';
import { ShowLimbDialogComponent } from 'src/app/dialogs/definition/show-limb-dialog/show-limb-dialog.component';
import { ShowProfessionDialogComponent } from 'src/app/dialogs/definition/show-profession-dialog/show-profession-dialog.component';
import { ShowTypeOfAccidentDialogComponent } from 'src/app/dialogs/definition/show-type-of-accident-dialog/show-type-of-accident-dialog.component';
import { AlertifyService } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.scss']
})
export class DefinitionComponent implements OnInit {
  constructor(
    private alertify: AlertifyService,
    private dialog: MatDialog) {}

  ngOnInit(): void {
  }

  async showTypeOfAccidentDialog(typeOfAccidentData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowTypeOfAccidentDialogComponent, {
      width: '500px',
      data: typeOfAccidentData
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

  async showProfessionDialog(professionData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowProfessionDialogComponent, {
      width: '500px',
      data: professionData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Meslek türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }

  async showAccidentAreaDialog(accidentAreaData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowAccidentAreaDialogComponent, {
      width: '500px',
      data: accidentAreaData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('Kaza yeri türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }

  async showDirectorateDialog(directorateData: any): Promise<void> {
    const dialogRef = await this.dialog.open(ShowDirectorateDialogComponent, {
      width: '500px',
      data: directorateData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.error) {
        console.error('İşletme türü bilgileri getirilirken bir hata oluştu:', result.error);
      }
    });
  }
}