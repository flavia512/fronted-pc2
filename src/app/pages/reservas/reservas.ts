import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { Reserva } from '../../core/models/reserva.model';

@Component({
  selector: 'app-reservas',
  imports: [DatePipe, RouterLink],
  templateUrl: './reservas.html',
})
export class Reservas implements OnInit {
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private configuracionService = inject(ConfiguracionService);

  reservas = signal<Reserva[]>([]);
  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  readonly linkSoporte = this.configuracionService.linkSoporte;
  readonly esInvitado = this.authService.esInvitado;
  modalCancelarId = signal<number | null>(null);
  private toastTimeout: any;

  ngOnInit(): void {
    this.configuracionService.cargarSoporte();
    if (this.esInvitado() || !this.authService.estaAutenticado()) return;
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.obtenerReservasPorUsuario().subscribe({
      next: (res) => this.reservas.set(res.datos ?? []),
      error: () => this.reservas.set([])
    });
  }

  eliminarReserva(id: number): void {
    if (!this.authService.estaAutenticado()) {
      this.mostrarToast('error', 'Para cancelar una reserva tienes que iniciar sesión');
      setTimeout(() => this.router.navigate(['/login']), 1500);
      return;
    }
    this.modalCancelarId.set(id);
  }

  confirmarCancelacion(): void {
    const id = this.modalCancelarId();
    if (id === null) return;
    this.modalCancelarId.set(null);
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
}
