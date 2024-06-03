import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { List_Personnel } from 'src/app/contracts/personnels/list_personnel';
import { AccidentAddComponent } from 'src/app/dialogs/accident/accident-add-dialog/accident-add.component';
import { AccidentListComponent } from 'src/app/dialogs/accident/accident-list/accident-list.component';
import { AccidentUpdateDialogComponent } from 'src/app/dialogs/accident/accident-update-dialog/accident-update-dialog.component';
import { PersonnelAddDialogComponent } from 'src/app/dialogs/personnel/personnel-add-dialog/personnel-add-dialog.component';
import { PersonnelUpdateDialogComponent } from 'src/app/dialogs/personnel/personnel-update-dialog/personnel-update-dialog.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['trIdNumber', 'name', 'surname', 'retiredId', 'insuranceId', 'startDateOfWork', 'profession', 'typeOfPlace', 'tKIId', 'unit', 'taskInstruction', 'accidentAdd', 'accidentList', 'personnelUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Personnel> = new MatTableDataSource<List_Personnel>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(spinner: NgxSpinnerService,
    private personnelService: PersonnelService,
    private alertifyService: AlertifyService,
    private dialogService: DialogService,
    private dialog: MatDialog ) {
    super(spinner)
  }

  async ngOnInit() {
    await this.getPersonnels();
  }

  async pageChanged() {
    await this.getPersonnels();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getPersonnels() {
    const allPersonnels: {datas: List_Personnel[], totalCount: number} = await this.personnelService.getPersonnels(this.paginator ? this.paginator.pageIndex : 0, this.paginator ? this.paginator.pageSize : 5, () => this.hideSpinner(SpinnerType.BallAtom), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))

    this.dataSource = new MatTableDataSource<List_Personnel>(allPersonnels.datas);
    this.paginator.length = allPersonnels.totalCount;
    this.dataSource.sort = this.sort;
  }

  openPersonnelAddDialog(): void {
    const dialogRef = this.dialog.open(PersonnelAddDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getPersonnels();
      }
    });
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

  async openUpdatePersonnelDialog(personnelData: any): Promise<void> {
    const dialogRef = await this.dialog.open(PersonnelUpdateDialogComponent, {
      width: '500px',
      data: personnelData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Personnel updated successfully!');
      } else if (result && result.error) {
        console.error('Failed to update personnel:', result.error);
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