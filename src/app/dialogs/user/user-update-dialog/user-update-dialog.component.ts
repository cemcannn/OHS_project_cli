import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_User } from 'src/app/contracts/users/update_user';
import { UserService } from 'src/app/services/common/models/user.service';

@Component({
  selector: 'app-user-update-dialog',
  templateUrl: './user-update-dialog.component.html',
  styleUrls: ['./user-update-dialog.component.scss']
})
export class UserUpdateDialogComponent extends BaseDialog<UserUpdateDialogComponent> implements OnInit {

  constructor(dialogRef: MatDialogRef<UserUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userId: string,
      email: string,
      name: string,
      userName: string
    },
    private userService: UserService,
    private alertifyService: AlertifyService,
  ) {super(dialogRef)}

  ngOnInit(

  ): void {    console.log(this.data);}

  updateUser(): void {
    const updateUser: Update_User = {
      id: this.data.userId,
      email: this.data.email,
      name: this.data.name,
      userName: this.data.userName,
    };

    this.userService.updateUser(updateUser).then(
      () => {
        this.alertifyService.message('Kullanıcı bilgileri başarıyla güncellendi.', {
          dismissOthers: true,
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.alertifyService.message('Kullanıcı bilgileri güncelenirken bir sorun oluştu.', {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: false });
      }
    );
  }
}