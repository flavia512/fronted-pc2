import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface ConductorReserva {
  nombre: string;
  inicial: string;
  vehiculo: string;
}

export interface Reserva {
  id: number;
  origen: string;
  destino: string;
  estadoPago: 'Confirmada' | 'Pendiente' | 'Cancelada';
  estadoViaje: 'Completado' | 'Próximo';
  fecha: string;
  horaSalida: string;
  asientosReservados: number;
  puntoEncuentro: string;
  precioTotal: number;
  conductor: ConductorReserva;
}

@Component({
  selector: 'app-reservas',
  imports: [CommonModule, RouterModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss'
})
export class Reservas implements OnInit {
  // Inicializamos el array estrictamente vacío
  reservas: Reserva[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarReservasUsuario();
  }

  // ESTRUCTURA PREPARADA PARA CONEXIÓN BACKEND:
  cargarReservasUsuario(): void {
    this.cargando = true;

    // Cuando conectes el backend, esto será un this.http.get().subscribe(...)
    // Por ahora, simulamos una base de datos vacía.
    setTimeout(() => {
      this.reservas = []; // Nos aseguramos de que no hay datos falsos
      this.cargando = false;
    }, 300); // He bajado el tiempo de carga para que la transición sea más fluida
  }
}