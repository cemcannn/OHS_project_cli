import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { UserService } from 'src/app/services/common/models/user.service';
import { BaseDialog } from '../../base/base-dialog';

@Component({
  selector: 'app-user-password-update-component',
  templateUrl: './user-password-update.component.html',
  styleUrl: './user-password-update.component.scss'
})
export class UserPasswordUpdateComponent extends BaseDialog<UserPasswordUpdateComponent> implements OnInit {

  constructor(dialogRef: MatDialogRef<UserPasswordUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userId: string,
      password: string,
      passwordConfirm: string
    },
    private alertifyService: AlertifyService,
    private userService: UserService) 
    {super(dialogRef)}


  ngOnInit(): void {}

  async updatePassword() {
    const password = this.data.password;
    const passwordConfirm = this.data.passwordConfirm;
    if (password !== passwordConfirm) {
      this.alertifyService.message("Şifreleri doğrulayınız!", {
        messageType: MessageType.Error,
        position: Position.TopRight
      });
      return;
    }

    await this.userService.updatePassword(this.data.userId, this.data.password, this.data.passwordConfirm,
      () => {
        this.alertifyService.message("Şifre başarıyla güncellenmiştir.", {
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close();
      },
      error => {
        console.log(error)
      });
  }
}
