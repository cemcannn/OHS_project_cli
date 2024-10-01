// src/app/components/personnel/list/list.component.ts

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { List_Personnel } from 'src/app/contracts/personnels/list_personnel';
import { PersonnelFilterService } from 'src/app/services/common/personnel-filter.service';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentListComponent } from 'src/app/dialogs/accident/accident-list/accident-list.component';
import { PersonnelUpdateDialogComponent } from 'src/app/dialogs/personnel/personnel-update-dialog/personnel-update-dialog.component';
import { AccidentAddComponent } from 'src/app/dialogs/accident/accident-add-dialog/accident-add.component';
import { PersonnelAddDialogComponent } from 'src/app/dialogs/personnel/personnel-add-dialog/personnel-add-dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['tkiId','name', 'surname', 'profession', 'directorate', 'bornDate', 'accidentAdd', 'accidentList', 'personnelUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Personnel> = new MatTableDataSource<List_Personnel>();
  allPersonnels: List_Personnel[] = [];
  directorates: string[] = [];
  selectedDirectorate: string = 'Tüm İşletmeler';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    spinner: NgxSpinnerService,
    private personnelService: PersonnelService,
    private personnelFilterService: PersonnelFilterService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {
    super(spinner);
  }

  async pageChanged() {
    await this.loadPersonnels();
  }

  async ngOnInit() {
    await this.loadPersonnels();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadPersonnels() {
    this.showSpinner(SpinnerType.Cog);
    const allPersonnels: { datas: List_Personnel[]; totalCount: number } =
      await this.personnelService.getPersonnels(
        () => this.hideSpinner(SpinnerType.Cog),
        (errorMessage) =>
          this.alertifyService.message(errorMessage, {
            dismissOthers: true,
            messageType: MessageType.Error,
            position: Position.TopRight,
          })
      );

    this.allPersonnels = allPersonnels.datas;

    // İşletmeleri (directorates) listeye ekle
    this.directorates = [
      'Tüm İşletmeler',
      ...new Set(this.allPersonnels.map((personnel) => personnel.directorate)),
    ];

    this.applyFilters();
  }

  applyFilters() {
    const filters = {
      directorate: this.selectedDirectorate,
    };

    const filteredPersonnels = this.personnelFilterService.applyFilters(
      this.allPersonnels,
      filters
    );
    this.dataSource = new MatTableDataSource<List_Personnel>(filteredPersonnels);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
  
    // İsim ve soyisim kolonlarını birleştirerek arama
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const combinedName = `${data.name} ${data.surname}`.toLowerCase();
      return combinedName.includes(filter);
    };
  
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }  

  async openPersonnelAddDialog(): Promise<void> {
    const dialogRef = this.dialog.open(PersonnelAddDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadPersonnels();
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
        this.loadPersonnels();
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
        this.loadPersonnels();
      }
    });
  }
}
