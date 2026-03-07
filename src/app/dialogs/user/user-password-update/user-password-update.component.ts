import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { UserService } from 'src/app/services/common/models/user.service';
import { BaseDialog } from '../../base/base-dialog';
import { strongPasswordValidator, passwordMatchValidator } from 'src/app/validators/user-validators';

@Component({
  selector: 'app-user-password-update-component',
  templateUrl: './user-password-update.component.html',
  styleUrl: './user-password-update.component.scss'
})
export class UserPasswordUpdateComponent extends BaseDialog<UserPasswordUpdateComponent> implements OnInit {
  passwordForm: FormGroup;

  constructor(dialogRef: MatDialogRef<UserPasswordUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string },
    private alertifyService: AlertifyService,
    private userService: UserService,
    private fb: FormBuilder)
  {
    super(dialogRef);
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      passwordConfirm: ['', [Validators.required, passwordMatchValidator('password')]]
    });
  }

  ngOnInit(): void {}

  async updatePassword() {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { currentPassword, password, passwordConfirm } = this.passwordForm.value;

    await this.userService.updatePassword(
      this.data.userId,
      currentPassword.trim(),
      password.trim(),
      passwordConfirm.trim(),
      () => {
        this.alertifyService.message('Şifre başarıyla güncellendi.', {
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: true });
      },
      error => {
        this.alertifyService.message('Mevcut şifre hatalı veya bir sorun oluştu.', {
          messageType: MessageType.Error,
          position: Position.TopRight
        });
      }
    );
  }
}
