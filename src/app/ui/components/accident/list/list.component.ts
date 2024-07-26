import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { AccidentUpdateDialogComponent } from 'src/app/dialogs/accident/accident-update-dialog/accident-update-dialog.component';
import { AccidentService } from 'src/app/services/common/models/accident.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  displayedColumns: string[] = ['tkiId', 'name', 'surname', 'typeOfAccident', 'limb', 'accidentArea', 'accidentDate', 'accidentHour', 'reportDay', 'description', 'accidentUpdate', 'delete']; // Added 'reportDay' column
  dataSource: MatTableDataSource<List_Accident> = null;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    spinner: NgxSpinnerService,
    private accidentService: AccidentService,
    private dialog: MatDialog,
  ) {
    super(spinner);
  }

  async pageChanged() {
    await this.loadAccidents();
  }

  async ngOnInit() {
    await this.loadAccidents();
  }

  async openUpdateAccidentDialog(accidentData: any): Promise<void> {
    const dialogRef = await this.dialog.open(AccidentUpdateDialogComponent, {
      width: '500px',
      data: accidentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Accident updated successfully!');
        this.loadAccidents(); // Refresh the list after update
      } else if (result && result.error) {
        console.error('Failed to update accident:', result.error);
      }
    });
  }

  async loadAccidents(): Promise<void> {
    const allAccidents: { datas: List_Accident[], totalCount: number } = await this.accidentService.getAccidents();
  
    // Use the correct type for MatTableDataSource
    this.dataSource = new MatTableDataSource<List_Accident>(allAccidents.datas);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
