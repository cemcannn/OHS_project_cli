import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from '../../../../base/base.component';
import { List_User } from '../../../../contracts/users/list_user';
import { AuthorizeUserDialogComponent } from '../../../../dialogs/authorize/authorize-user-dialog/authorize-user-dialog.component';
import { AlertifyService, MessageType, Position } from '../../../../services/admin/alertify.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { UserService } from '../../../../services/common/models/user.service';
import { UserUpdateDialogComponent } from 'src/app/dialogs/user/user-update-dialog/user-update-dialog.component';
import { UserPasswordUpdateComponent } from 'src/app/dialogs/user/user-password-update/user-password-update.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {


  constructor(spinner: NgxSpinnerService,
    private userService: UserService,
    private alertifyService: AlertifyService,
    private dialogService: DialogService) {
    super(spinner)
  }


  displayedColumns: string[] = ['userName', 'name', 'email', 'role', 'userUpdate', 'passwordUpdate', 'delete'];
  dataSource: MatTableDataSource<List_User> = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  async getUsers() {
    this.showSpinner(SpinnerType.Cog);

    const allUsers: { totalUsersCount: number; users: List_User[] } = await this.userService.getAllUsers(() => this.hideSpinner(SpinnerType.Cog), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))
    this.dataSource = new MatTableDataSource<List_User>(allUsers.users);
    this.paginator.length = allUsers.totalUsersCount;
  }

  async pageChanged() {
    await this.getUsers();
  }

  async ngOnInit() {
    await this.getUsers();
  }

  assignRole(id: string) {
    this.dialogService.openDialog({
      componentType: AuthorizeUserDialogComponent,
      data: id,
      options: {
        width: "750px"
      },
      afterClosed: () => {
        this.alertifyService.message("Roller başarıyla atanmıştır!", {
          messageType: MessageType.Success,
          position: Position.TopRight
        })
      }
    });
  }

  openUpdateUserDialog(id: string) {
    this.dialogService.openDialog({
      componentType: UserUpdateDialogComponent,
      data: id,
      options: {
        width: "750px"
      },
      afterClosed: () => {
        this.alertifyService.message("Kullanıcı başarıyla güncellenmiştir!", {
          messageType: MessageType.Success,
          position: Position.TopRight
        })
      }
    });
  }

  openUpdatePasswordDialog(id: any) {
    this.dialogService.openDialog({
      componentType: UserPasswordUpdateComponent,
      data: { userId: id }, // userId'yi gönderiyoruz
      options: {
        width: '400px',
      },
      afterClosed: () => {
        this.alertifyService.message('Şifre güncelleme işlemi tamamlandı.', {
          messageType: MessageType.Success,
          position: Position.TopRight,
        });
      },
    });
  }
}