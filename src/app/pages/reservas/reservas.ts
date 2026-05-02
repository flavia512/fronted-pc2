import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';

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
  };
}

export interface ReservasResponse {
  ok: boolean;
  reservas: Reserva[];
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
})
export class Reservas implements OnInit {
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);

  reservas = signal<Reserva[]>([]);
  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  private toastTimeout: any;

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    this.reservaService.obtenerReservasPorUsuario(userId).subscribe({
      next: (res: ReservasResponse) => this.reservas.set(res.reservas ?? []),
      error: () => this.reservas.set([])
    });
  }

  eliminarReserva(id: number): void {
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
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.set(null), 3000);
  }

  cerrarToast(): void {
    this.toast.set(null);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }
}
