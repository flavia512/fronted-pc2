import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import {SoporteTecnico} from '../../shared/components/soporteTecnico/soporteTecnico';

export interface Reserva {
  id: number;
  user_id: number;
  trip_id: number;
  seats: number;
  status: string;
  viaje?: {
    origin: string;
    destiny: string;
    trip_datetime: string;
    conductor?: {
      full_name?: string;
      email?: string;
    };
  };
}

export interface ReservasResponse {
  ok: boolean;
  reservas: Reserva[];
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservas.html',
})
export class Reservas implements OnInit {
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  reservas = signal<Reserva[]>([]);
  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  esInvitado = computed(() => this.authService.isGuest());
  private toastTimeout: any;

  ngOnInit(): void {
    if (this.esInvitado() || !this.authService.isLoggedIn()) return;
    this.cargarReservas();
  }

  cargarReservas(): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      this.mostrarToast('error', 'No se pudo identificar el usuario.');
      return;
    }

    this.reservaService.obtenerReservasPorUsuario(userId).subscribe({
      next: (res: ReservasResponse) => this.reservas.set(res.reservas ?? []),
      error: () => this.reservas.set([])
    });
  }

  eliminarReserva(id: number): void {
    if (!this.authService.isLoggedIn()) {
      this.mostrarToast('error', 'Para cancelar una reserva tienes que iniciar sesión');

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

      return;
    }

    if (!confirm('¿Cancelar esta reserva?')) return;

    this.reservaService.eliminarReserva(id).subscribe({
      next: () => {
        this.reservas.update(list => list.filter(r => r.id !== id));
        this.mostrarToast('exito', 'Reserva cancelada.');
      },
      error: () => this.mostrarToast('error', 'No se pudo cancelar la reserva.')
    });
  }

  mostrarToast(tipo: 'exito' | 'error', mensaje: string): void {
    this.toast.set({ tipo, mensaje });

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => this.toast.set(null), 3000);
  }

  cerrarToast(): void {
    this.toast.set(null);

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
  copiarSoporte(): void {

    navigator.clipboard.writeText(SoporteTecnico.soporteLink);

    alert('Link copiado al portapapeles');

  }

}
