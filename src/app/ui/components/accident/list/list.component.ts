import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { AccidentAddComponent } from 'src/app/dialogs/accident-add-dialog/accident-add.component';
import { AccidentListComponent } from 'src/app/dialogs/accident-list/accident-list.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { AccidentService } from 'src/app/services/common/models/accident.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {


  constructor(spinner: NgxSpinnerService,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialogService: DialogService,
    private dialog: MatDialog) {
    super(spinner)
  }


  displayedColumns: string[] = ['trIdNumber', 'name', 'surname', 'typeOfAccident', 'accidentDate', 'accidentHour', 'onTheJobDate', 'description'];
  dataSource: MatTableDataSource<List_Accident> = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  async getPersonnels() {
    this.showSpinner(SpinnerType.BallAtom);

    const allAccidents: {datas: List_Accident[], totalCount: number} = await this.accidentService.getAccidents(this.paginator ? this.paginator.pageIndex : 0, this.paginator ? this.paginator.pageSize : 5, () => this.hideSpinner(SpinnerType.BallAtom), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))

    this.dataSource = new MatTableDataSource<List_Accident>(allAccidents.datas);

  }

  async pageChanged() {
    await this.getPersonnels();
  }

  async ngOnInit() {
    await this.getPersonnels();
  }

  openAccidentAddDialog(id: number): void {
    const dialogRef = this.dialog.open(AccidentAddComponent, {
      width: '400px',
      data: { personnelId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getPersonnels();
      }
    });
  }

  openAccidentDialog(id: string): void {
    const dialogRef = this.dialog.open(AccidentListComponent, {
      width: '800px',
      data: { personId: id }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getPersonnels();
      }
    });
  }
}