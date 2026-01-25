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
    @Inject(MAT_DIALOG_DATA) public data: {
      userId: string;
      password?: string;
      passwordConfirm?: string;
    },
    private alertifyService: AlertifyService,
    private userService: UserService,
    private fb: FormBuilder) 
    {
      super(dialogRef);
      this.passwordForm = this.fb.group({
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
      
      if (this.passwordForm.hasError('passwordMatch', 'passwordConfirm')) {
        this.alertifyService.message("Şifreler eşleşmiyor!", {
          messageType: MessageType.Error,
          position: Position.TopRight
        });
      }
      return;
    }

    const formValue = this.passwordForm.value;
    const password = formValue.password.trim();
    const passwordConfirm = formValue.passwordConfirm.trim();

    await this.userService.updatePassword(this.data.userId, password, passwordConfirm,
      () => {
        this.alertifyService.message("Şifre başarıyla güncellenmiştir.", {
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close(this.data);
      },
      error => {
        // Error handled by interceptor
      });
  }
}
