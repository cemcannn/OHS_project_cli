import { Component, OnInit } from '@angular/core';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { UserService } from 'src/app/services/common/models/user.service';
import { List_User } from 'src/app/contracts/users/list_user';
import { Update_User } from 'src/app/contracts/users/update_user';
import { AuthService } from 'src/app/services/common/auth.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {

  user: List_User = {
    id: '',
    name: '',
    email: '',
    userName: '',
    twoFactorEnabled: false
  };

  constructor(
    private userService: UserService, 
    private alertifyService: AlertifyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  async loadUserData(): Promise<void> {
    try {
      const userId = this.authService.getUserId(); // Kullanıcının ID'si AuthService üzerinden alınıyor
      this.user = await this.userService.getUserById(userId);
    } catch (err) {
      this.alertifyService.message('Kullanıcı bilgileri yüklenirken hata oluştu.', {
        messageType: MessageType.Error,
        position: Position.TopRight
      });
      console.error(err);
    }
  }

  async updateUser(): Promise<void> {
    try {
      const updatedUser: Update_User = {
        id: this.user.id,
        name: this.user.name,
        email: this.user.email
      };
      await this.userService.updateUser(updatedUser);
      this.alertifyService.message('Kullanıcı bilgileri başarıyla güncellendi.', {
        messageType: MessageType.Success,
        position: Position.TopRight
      });
    } catch (err) {
      this.alertifyService.message('Kullanıcı bilgileri güncellenirken hata oluştu.', {
        messageType: MessageType.Error,
        position: Position.TopRight
      });
      console.error(err);
    }
  }
}