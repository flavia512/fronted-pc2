import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Esta interfaz coincide con tu modelo de base de datos
export interface ViajeCompartido {
  id: number;
  driver_user_id: number;
  route_id: number;
  origin: string;
  destiny: string;
  trip_datetime: string;
  seats_total: number;
  seats_available: number;
  status: string;
  // Relación de Laravel (se asume que el backend hace un ->with('conductor'))
  conductor?: {
    full_name: string;
  };
}

@Component({
  selector: 'app-viajes-compartidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes-compartidos.html',
  styleUrl: './viajes-compartidos.scss',
})
export class ViajesCompartidos {
  // Variables atadas al buscador (ngModel)
  origin: string = '';
  destiny: string = '';
  fecha: string = '';

  // Datos simulados estructurados exactamente como responderá Laravel
  viajes: ViajeCompartido[] = [
    {
      id: 1,
      driver_user_id: 10,
      route_id: 1,
      origin: 'Alcorcón',
      destiny: 'Príncipe Pío',
      trip_datetime: '2026-04-10T08:00:00', // Formato estándar de base de datos
      seats_total: 4,
      seats_available: 3,
      status: 'activo',
      conductor: { full_name: 'Juan Pérez' }
    },
    {
      id: 2,
      driver_user_id: 12,
      route_id: 2,
      origin: 'Móstoles',
      destiny: 'Príncipe Pío',
      trip_datetime: '2026-04-10T07:30:00',
      seats_total: 4,
      seats_available: 2,
      status: 'activo',
      conductor: { full_name: 'Ana Gómez' }
    }
  ];

  buscarViajes() {
    console.log('Buscando viajes con:', { origin: this.origin, destiny: this.destiny, fecha: this.fecha });
    // Aquí se llamará al servicio HTTP pasando estos parámetros O los que sean necesarios para hacer la busqueda en la base de datos 
  }
}