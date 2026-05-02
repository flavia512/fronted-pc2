import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, switchMap } from 'rxjs';
import { ViajeCompartidoService } from '../../core/services/viaje-compartido.service';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';

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
  conductor?: { id?: number; name?: string };
}

@Component({
  selector: 'app-viajes-compartidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes-compartidos.html',
})
export class ViajesCompartidos implements OnInit, OnDestroy {
  private viajeService = inject(ViajeCompartidoService);
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);

  viajes = signal<ViajeCompartido[]>([]);
  cargando = signal(true);

  filtroOrigen = '';
  filtroDestino = '';
  filtroFecha = '';

  private filtros$ = new Subject<void>();
  private sub?: Subscription;

  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  private toastTimeout: any;

  ngOnInit(): void {
    this.sub = this.filtros$.pipe(
      debounceTime(400),
      switchMap(() => {
        this.cargando.set(true);
        const hayFiltros = this.filtroOrigen.trim() || this.filtroDestino.trim() || this.filtroFecha;
        if (hayFiltros) {
          return this.viajeService.buscarViajes({
            origin:  this.filtroOrigen.trim()  || undefined,
            destiny: this.filtroDestino.trim() || undefined,
            fecha:   this.filtroFecha          || undefined,
          });
        }
        return this.viajeService.listarViajes();
      })
    ).subscribe({
      next: (res: any) => { this.viajes.set(res.data ?? []); this.cargando.set(false); },
      error: () => { this.viajes.set([]); this.cargando.set(false); }
    });

    this.filtros$.next(); // carga inicial
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  onFiltroChange(): void {
    this.filtros$.next();
  }

  limpiarFiltros(): void {
    this.filtroOrigen = '';
    this.filtroDestino = '';
    this.filtroFecha = '';
    this.filtros$.next();
  }

  reservando = signal<number | null>(null);

  reservarViaje(viaje: ViajeCompartido): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    if (viaje.seats_available < 1) {
      this.mostrarToast('error', 'No quedan asientos disponibles.');
      return;
    }
    this.reservando.set(viaje.id);
    this.reservaService.crearReserva({
      user_id: userId,
      trip_id: viaje.id,
      seats: 1,
      status: 'pending'
    }).subscribe({
      next: () => {
        this.reservando.set(null);
        this.mostrarToast('exito', '¡Reserva realizada con éxito!');
        // Decrementar visualmente los asientos
        this.viajes.update(list =>
          list.map(v => v.id === viaje.id ? { ...v, seats_available: v.seats_available - 1 } : v)
        );
      },
      error: () => {
        this.reservando.set(null);
        this.mostrarToast('error', 'No se pudo realizar la reserva. Inténtalo de nuevo.');
      }
    });
  }

  mostrarToast(tipo: 'exito' | 'error', mensaje: string): void {
    this.toast.set({ tipo, mensaje });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.set(null), 5000);
  }

  cerrarToast(): void {
    this.toast.set(null);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }
}

