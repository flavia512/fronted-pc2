import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Viaje {
  id: number;
  origen: string;
  destino: string;
  etiqueta: string;
  fecha: string;
  hora: string;
  asientos: number;
  descripcion: string;
  conductor: string;
  inicial: string;
  vehiculo: string;
  precio: number;
}

@Component({
  selector: 'app-viajes-compartidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes-compartidos.html',
  styleUrl: './viajes-compartidos.scss',
})
export class ViajesCompartidos {
  origen: string = '';
  destino: string = '';
  fecha: string = '';

  viajes: Viaje[] = [
    {
      id: 1,
      origen: 'Alcorcón',
      destino: 'Príncipe Pío',
      etiqueta: 'M-30',
      fecha: 'vie, 10 abr',
      hora: '08:00',
      asientos: 3,
      descripcion: 'Viaje diario al trabajo, paso por M-30 Sur',
      conductor: 'Juan Pérez',
      inicial: 'J',
      vehiculo: 'Toyota Corolla Blanco',
      precio: 3.50
    },
    {
      id: 2,
      origen: 'Móstoles',
      destino: 'Príncipe Pío',
      etiqueta: 'M-30',
      fecha: 'vie, 10 abr',
      hora: '07:30',
      asientos: 2,
      descripcion: 'Ruta rápida desde Móstoles a la estación central',
      conductor: 'Ana Gómez',
      inicial: 'A',
      vehiculo: 'Seat Ibiza Rojo',
      precio: 4.00
    }
  ];

  buscarViajes() {
    console.log('Buscando viajes:', this.origen, this.destino, this.fecha);
  }
} 