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
  displayedColumns: string[] = ['tkiId','name', 'surname', 'profession', 'bornDate', 'accidentAdd', 'accidentList', 'personnelUpdate', 'delete'];
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
    const allPersonnels: {datas: List_Personnel[], totalCount: number} = await this.personnelService.getPersonnels(() => this.hideSpinner(SpinnerType.BallAtom), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))

    this.dataSource = new MatTableDataSource<List_Personnel>(allPersonnels.datas);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async openPersonnelAddDialog(): Promise<void> {
    const dialogRef = this.dialog.open(PersonnelAddDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getPersonnels();
      }
    });
  }

  async openAccidentAddDialog(id: number): Promise<void> {
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

  async openPersonnelUpdateDialog(personnelData: any): Promise<void> {
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

  async openAccidentsDialog(id: string): Promise<void> {
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}