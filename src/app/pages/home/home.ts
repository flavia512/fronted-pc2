import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  protected auth = inject(AuthService);
  private router = inject(Router);

  entrarComoInvitado(): void {
    this.auth.continuarComoInvitado();
    this.router.navigate(['/viajes-compartidos']);
  }
}