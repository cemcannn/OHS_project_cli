import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { UserService } from 'src/app/services/common/models/user.service';
import { List_User } from 'src/app/contracts/users/list_user';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from 'src/app/services/common/dialog.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UserUpdateDialogComponent } from 'src/app/dialogs/user/user-update-dialog/user-update-dialog.component';
import { UserPasswordUpdateComponent } from 'src/app/dialogs/user/user-password-update/user-password-update.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent extends BaseComponent implements OnInit {


  constructor(spinner: NgxSpinnerService,
    private userService: UserService,
    private alertifyService: AlertifyService,
    private dialogService: DialogService,
    private dialog: MatDialog) {
    super(spinner)
  }

  displayedColumns: string[] = ['userName', 'name', 'email', 'role', 'userUpdate', 'delete'];
  dataSource: MatTableDataSource<List_User> = null;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  user: List_User = null;
  userId: string = null;

  async ngOnInit() {
    await this.getUserId()
    await this.getUser(this.userId);
  }

  async getUserId() {
    const token = localStorage.getItem("accessToken");
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (decodedToken) {
      return this.userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    }
    return null;
  }

  async getUser(userId: string) {
    this.showSpinner(SpinnerType.Cog);

    this.user = await this.userService.getUserById(userId, () => this.hideSpinner(SpinnerType.Cog), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))
  }

  async openUpdateUserDialog(userData: any, id: any): Promise<void>  {
    const dialogRef = await this.dialog.open(UserUpdateDialogComponent, {
      width: '500px',
      data: {
        userId: id,
        email: userData.email,
        name: userData.name, 
        userName: userData.userName
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Kullanıcı başarıyla güncellenmiştir!');
      } else if (result && result.error) {
        console.error('Kullanıcı güncellenirken hata oluştu:', result.error);
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
