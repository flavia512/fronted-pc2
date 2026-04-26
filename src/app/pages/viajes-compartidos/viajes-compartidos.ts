import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViajeCompartidoService } from '../../core/services/viaje-compartido.service';

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

  conductor?: {
    id?: number;
    name?: string;
  };

  ruta?: {
    id?: number;
    name?: string;
  };

  reservas?: any[];
}

@Component({
  selector: 'app-viajes-compartidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes-compartidos.html',
  styleUrl: './viajes-compartidos.scss',
})
export class ViajesCompartidos implements OnInit {

  private viajeService = inject(ViajeCompartidoService);

  origin: string = '';
  destiny: string = '';
  fecha: string = '';
  errorMessage = '';

  viajes: ViajeCompartido[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.listarViajes();
  }

  listarViajes(): void {
    this.loading = true;

    this.viajeService.listarViajes().subscribe({
      next: (response: any) => {
        this.viajes = response.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.viajes = [];
        this.loading = false;
      }
    });
  }

  verDetalle(id: number | undefined): void {
    if (!id) return;
    console.log('Detalle viaje:', id);
  }

  trackById(_: number, item: ViajeCompartido): number {
    return item.id;
  }

  eliminarViaje(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este viaje?')) return;

    this.viajeService.eliminarViaje(id).subscribe({
      next: () => {
        console.log('Viaje eliminado correctamente');
        // Aquí podrías recargar la lista de viajes o actualizar el estado
      },
      error: (err) => {
        console.error('Error eliminando viaje:', err);
        this.errorMessage = 'Error al eliminar el viaje';
      }
    });
  }

}
