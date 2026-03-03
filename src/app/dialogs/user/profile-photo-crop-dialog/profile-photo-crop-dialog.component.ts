import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-profile-photo-crop-dialog',
  templateUrl: './profile-photo-crop-dialog.component.html',
  styleUrls: ['./profile-photo-crop-dialog.component.scss']
})
export class ProfilePhotoCropDialogComponent {
  imageBase64: string;
  croppedImage: string = '';

  constructor(
    public dialogRef: MatDialogRef<ProfilePhotoCropDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageBase64: string }
  ) {
    this.imageBase64 = data.imageBase64;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 || '';
  }

  confirm() {
    this.dialogRef.close(this.croppedImage);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
