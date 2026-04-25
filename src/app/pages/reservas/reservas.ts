import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Asegúrate de importar la interfaz desde el archivo correspondiente
// import { Reserva } from '../../core/models/reserva.model';

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

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss'
})
export class Reservas implements OnInit {
  reservas: Reserva[] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarReservasUsuario();
  }

  cargarReservasUsuario(): void {
    this.cargando = true;

    // Simulación de los datos exactos del backend 
    // (Asumiendo que el backend envía la relación del viaje)
    setTimeout(() => {
      this.reservas = [
        {
          id: 1,
          user_id: 10,
          trip_id: 2,
          seats: 2,
          status: 'confirmada',
          viaje: {
            origin: 'Alcorcón',
            destiny: 'Príncipe Pío',
            trip_datetime: '2026-04-10T08:00:00'
          }
        }
      ];
      this.cargando = false;
    }, 300);
  }
}