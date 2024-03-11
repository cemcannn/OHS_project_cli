import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/common/auth.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(public authService: AuthService) {
    authService.identityCheck();
  }
}
