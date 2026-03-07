import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { ProfilePhotoCropDialogComponent } from 'src/app/dialogs/user/profile-photo-crop-dialog/profile-photo-crop-dialog.component';
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
  @ViewChild('photoInput') photoInput: ElementRef<HTMLInputElement>;

  user: List_User = null;
  userId: string = null;
  photoPreview: string | null = null;
  uploadingPhoto = false;

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
    }));
    this.photoPreview = this.user?.profilePhoto || null;
  }

  triggerPhotoInput() {
    this.photoInput.nativeElement.click();
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      this.photoPreview = reader.result as string;
      await this.uploadPhoto(this.photoPreview);
    };
    reader.readAsDataURL(file);
  }

  openCropDialog() {
    if (!this.photoPreview) return;

    const dialogRef = this.dialog.open(ProfilePhotoCropDialogComponent, {
      width: '520px',
      data: { imageBase64: this.photoPreview },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async (croppedBase64: string | null) => {
      if (!croppedBase64) return;
      this.photoPreview = croppedBase64;
      await this.uploadPhoto(croppedBase64);
    });
  }

  async uploadPhoto(photoBase64: string) {
    this.uploadingPhoto = true;
    try {
      await this.userService.uploadProfilePhoto(this.userId, photoBase64);
      this.userService.profilePhotoUpdated$.next(photoBase64);
      this.alertifyService.message('Profil fotoğrafı güncellendi.', {
        dismissOthers: true,
        messageType: MessageType.Success,
        position: Position.TopRight
      });
    } catch {
      this.alertifyService.message('Fotoğraf yüklenemedi.', {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    } finally {
      this.uploadingPhoto = false;
    }
  }

  async openUpdateUserDialog(userData: any, id: any): Promise<void>  {
    const dialogRef = await this.dialog.open(UserUpdateDialogComponent, {
      width: '500px',
      panelClass: 'no-padding-dialog',
      data: {
        userId: id,
        email: userData.email,
        name: userData.name,
        userName: userData.userName
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getUser(this.userId);
      }
    });
  }

  openUpdatePasswordDialog(id: any) {
    this.dialog.open(UserPasswordUpdateComponent, {
      width: '460px',
      panelClass: 'no-padding-dialog',
      data: { userId: id }
    });
  }

}
