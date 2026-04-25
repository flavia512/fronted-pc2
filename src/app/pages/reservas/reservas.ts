import { Component, OnInit, signal } from '@angular/core';
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
  reservas = signal<Reserva[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargarReservasUsuario();
  }

  cargarReservasUsuario(): void {
    this.cargando.set(true);

    // Simulación de los datos exactos del backend 
    // (Asumiendo que el backend envía la relación del viaje)
    setTimeout(() => {
      this.reservas.set([]); // Nos aseguramos de que no hay datos falsos
      this.cargando.set(false);
    }, 300);
  }
}