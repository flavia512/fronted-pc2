import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritoService } from '../../core/services/favorito.service';
import { AuthService } from '../../core/services/auth.service';
import { ReservaService } from '../../core/services/reserva.service';
import { ViajeCompartidoService, ViajeCompartido } from '../../core/services/viaje-compartido.service';
import { Favorito } from '../../core/models/favorito.model';
import {SoporteTecnico} from '../../shared/components/soporteTecnico/soporteTecnico';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.scss'
})
export class Favoritos implements OnInit {
  private favoritoService  = inject(FavoritoService);
  private authService      = inject(AuthService);
  private viajeService     = inject(ViajeCompartidoService);
  private reservaService   = inject(ReservaService);

  favoritos       = signal<Favorito[]>([]);
  cargando        = signal(false);
  error           = signal('');
  exito           = signal('');
  eliminando      = signal<number | null>(null);
  mostrarModalLogin = signal(false);
  esInvitado      = computed(() => this.authService.isGuest());

  // viajes expandidos por route_id
  viajesMap       = signal<Map<number, ViajeCompartido[]>>(new Map());
  cargandoViajes  = signal<number | null>(null);
  expandido       = signal<number | null>(null);
  reservando      = signal<number | null>(null);

  ngOnInit(): void {
    if (!this.esInvitado()) {
      this.cargarFavoritos();
    }
  }

  cargarFavoritos(): void {
    this.cargando.set(true);
    this.error.set('');
    this.favoritoService.listarFavoritos().subscribe({
      next: (res) => { this.favoritos.set(res.favoritos); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los favoritos.'); this.cargando.set(false); }
    });
  }

  toggleViajes(fav: Favorito): void {
    if (this.expandido() === fav.route_id) {
      this.expandido.set(null);
      return;
    }
    this.expandido.set(fav.route_id);
    if (this.viajesMap().has(fav.route_id)) return; // ya cargados

    this.cargandoViajes.set(fav.route_id);
    const origen  = fav.ruta?.origin_text ?? '';
    const destino = fav.ruta?.dest_text   ?? '';
    this.viajeService.buscarViajes({ origin: origen, destiny: destino }).subscribe({
      next: (res) => {
        this.viajesMap.update(m => { const n = new Map(m); n.set(fav.route_id, res.data); return n; });
        this.cargandoViajes.set(null);
      },
      error: () => {
        this.viajesMap.update(m => { const n = new Map(m); n.set(fav.route_id, []); return n; });
        this.cargandoViajes.set(null);
      }
    });
  }

  viajesDeRuta(routeId: number): ViajeCompartido[] {
    return this.viajesMap().get(routeId) ?? [];
  }

  reservarViaje(viaje: ViajeCompartido): void {
    const user = this.authService.currentUser();
    if (!user || this.reservando() === viaje.id) return;
    this.reservando.set(viaje.id);
    this.reservaService.crearReserva({ user_id: user.id, trip_id: viaje.id, seats: 1, status: 'pendiente' }).subscribe({
      next: () => {
        this.exito.set('¡Reserva realizada con éxito!');
        this.reservando.set(null);
        // actualizar asientos en el mapa
        this.viajesMap.update(m => {
          const n = new Map(m);
          n.forEach((lista, key) => {
            n.set(key, lista.map(v => v.id === viaje.id ? { ...v, seats_available: v.seats_available - 1 } : v));
          });
          return n;
        });
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo realizar la reserva.');
        this.reservando.set(null);
        setTimeout(() => this.error.set(''), 4000);
      }
    });
  }

  eliminarFavorito(fav: Favorito): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.eliminando.set(fav.route_id);
    this.favoritoService.eliminarFavorito(user.id, fav.route_id).subscribe({
      next: () => {
        this.favoritos.update(lista => lista.filter(f => f.route_id !== fav.route_id));
        this.exito.set('Eliminado de favoritos.');
        this.eliminando.set(null);
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: () => {
        this.error.set('No se pudo eliminar el favorito.');
        this.eliminando.set(null);
      }
    });
  }
  copiarSoporte(): void {

    navigator.clipboard.writeText(SoporteTecnico.soporteLink);

    alert('Link copiado al portapapeles');

  }
}
