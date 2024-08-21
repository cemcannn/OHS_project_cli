import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentUpdateDialogComponent } from '../accident-update-dialog/accident-update-dialog.component';


@Component({
  selector: 'app-accident-list',
  templateUrl: './accident-list.component.html',
  styleUrls: ['./accident-list.component.scss']
})
export class AccidentListComponent extends BaseDialog<AccidentListComponent> implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['typeOfAccident', 'limb', 'accidentArea', 'accidentDate', 'accidentHour', 'lostDayOfWork', 'description', 'accidentUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Accident> = new MatTableDataSource<List_Accident>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    dialogRef: MatDialogRef<AccidentListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {
    super(dialogRef);
  }

  async ngOnInit() {
    if (this.data && this.data.personId) {
      await this.loadAccidents(this.data.personId);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async openUpdateAccidentDialog(accidentData: any): Promise<void> {
    const dialogRef = await this.dialog.open(AccidentUpdateDialogComponent, {
      width: '500px',
      data: accidentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Kaza bilgileri başarıyla güncellendi!');
      } else if (result && result.error) {
        console.error('Kaza bilgileri güncellenirken bir hata oluştu:', result.error);
      }
    });
  }

  async loadAccidents(personId: string): Promise<void> {
    try {
      const allAccidents: { datas: List_Accident[], totalCount: number } = await this.accidentService.getAccidentById(personId);

      // Use the correct type for MatTableDataSource
      this.dataSource = new MatTableDataSource<List_Accident>(allAccidents.datas);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    catch (error) {
      this.alertifyService.message('Kaza bilgilerini yüklerken bir hata oluştu.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    }
  }
}
