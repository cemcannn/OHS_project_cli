import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { BaseDialog } from '../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { MatPaginator } from '@angular/material/paginator';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { DialogService } from 'src/app/services/common/dialog.service';
import { AccidentAddComponent } from '../accident-add-dialog/accident-add.component';

@Component({
  selector: 'app-accident-list',
  templateUrl: './accident-list.component.html',
  styleUrls: ['./accident-list.component.scss']
})
export class AccidentListComponent extends BaseDialog<AccidentListComponent> implements OnInit {
  displayedColumns: string[] = ['typeOfAccident', 'accidentDate', 'accidentHour', 'onTheJobDate', 'description', 'delete'];
  dataSource: MatTableDataSource<List_Accident> = new MatTableDataSource<List_Accident>();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    dialogRef: MatDialogRef<AccidentListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {
    super(dialogRef);
  }

  ngOnInit(): void {
    if (this.data && this.data.personId) {
      this.loadAccidents(this.data.personId);
    }
  }

  async loadAccidents(personId: string): Promise<void> {
    const allAccidents: { datas: List_Accident[], totalCount: number } = await this.accidentService.getAccidentById(personId);
  
    // Use the correct type for MatTableDataSource
    this.dataSource = new MatTableDataSource<List_Accident>(allAccidents.datas);
    this.dataSource.paginator = this.paginator;
  }  
}
