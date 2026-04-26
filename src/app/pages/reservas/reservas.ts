import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../core/services/reserva.service';

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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss'
})
export class Reservas implements OnInit {

  private reservaService = inject(ReservaService);

  reservas = signal<Reserva[]>([]);
  cargando = signal(true);

  mostrarModal = signal(false);

  nuevaReserva = {
    trip_id: null as number | null,
    seats: 1,
    status: 'pending'
  };

  ngOnInit(): void {
    this.cargarReservasUsuario();
  }

  cargarReservasUsuario(): void {
    this.cargando.set(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    this.reservaService.obtenerReservasPorUsuario(userId).subscribe({
      next: (res: ReservasResponse) => {
        this.reservas.set(res.reservas);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.reservas.set([]);
        this.cargando.set(false);
      }
    });
  }

  abrirModal(): void {
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.nuevaReserva = {
      trip_id: null,
      seats: 1,
      status: 'pending'
    };
  }

  crearReserva(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!this.nuevaReserva.trip_id) return;

    const payload = {
      user_id: user.id,
      trip_id: Number(this.nuevaReserva.trip_id),
      seats: Number(this.nuevaReserva.seats),
      status: this.nuevaReserva.status
    };

    this.reservaService.crearReserva(payload).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarReservasUsuario();
      },
      error: (err) => {
        console.error('Error creando reserva:', err);
      }
    });
  }
  eliminarReserva(id: number): void {

    if (!confirm('¿Eliminar esta reserva?')) return;

    this.reservaService.eliminarReserva(id).subscribe({
      next: () => {
        console.log('Reserva eliminada');

        this.cargarReservasUsuario();
      },
      error: (err) => {
        console.error('Error eliminando reserva:', err);
      }
    });
  }
}
