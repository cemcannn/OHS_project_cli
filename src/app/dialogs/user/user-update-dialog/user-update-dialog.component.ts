import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_User } from 'src/app/contracts/users/update_user';
import { UserService } from 'src/app/services/common/models/user.service';
import { usernameValidator, emailValidator } from 'src/app/validators/user-validators';

@Component({
  selector: 'app-user-update-dialog',
  templateUrl: './user-update-dialog.component.html',
  styleUrls: ['./user-update-dialog.component.scss']
})
export class UserUpdateDialogComponent extends BaseDialog<UserUpdateDialogComponent> implements OnInit {
  userForm: FormGroup;

  constructor(dialogRef: MatDialogRef<UserUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userId: string,
      email: string,
      name: string,
      userName: string
    },
    private userService: UserService,
    private alertifyService: AlertifyService,
    private fb: FormBuilder
  ) {
    super(dialogRef);
    this.userForm = this.fb.group({
      email: [data.email, [Validators.required, emailValidator()]],
      name: [data.name, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      userName: [data.userName, [Validators.required, usernameValidator()]]
    });
  }

  ngOnInit(): void {}

  updateUser(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.userForm.value;
    const updateUser: Update_User = {
      id: this.data.userId,
      email: formValue.email,
      name: formValue.name,
      userName: formValue.userName,
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