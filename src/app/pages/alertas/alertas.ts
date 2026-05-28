import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AlertaService } from '../../core/services/alerta.service';
import { AuthService } from '../../core/services/auth.service';
import { RutaService } from '../../core/services/ruta.service';
import { Alerta } from '../../core/models/alerta.model';
import { Ruta } from '../../core/models/ruta.model';

interface AlertaEnriquecida extends Alerta {
  rutaNombre?: string;
}

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class Alertas implements OnInit {
  private alertaService = inject(AlertaService);
  private authService  = inject(AuthService);
  private rutaService  = inject(RutaService);

  alertas  = signal<AlertaEnriquecida[]>([]);
  rutas    = signal<Ruta[]>([]);
  cargando = signal(false);
  error    = signal('');
  exito    = signal('');

  routeIdSeleccionado = signal<number | null>(null);
  fechaAlerta = signal('');
  horaAlerta  = signal('');

  consultando  = signal(false);
  prediccion   = signal<{
    nivel_gravedad: number;
    descripcion: string;
    minutos_antes: number;
    recomendacion: string;
    color: string;
  } | null>(null);

  creando      = signal(false);
  desactivando = signal<number | null>(null);

  readonly esInvitado = this.authService.esInvitado;

  rutasM30     = computed(() => this.rutas().filter(r => r.pasa_por_m30));
  alertasActivas = computed(() => this.alertas().filter(a => a.status === 'activa'));

  ngOnInit(): void {
    if (this.esInvitado()) return;
    this.cargarRutas();
    this.cargarAlertas();
  }

  // ── CARGAR RUTAS ─────────────────────────────────────────────────────────  
  cargarRutas(): void {
    this.rutaService.obtenerRutas().subscribe({
      next: (res) => this.rutas.set(res.datos ?? []),
      error: () => {}
    });
  }

// ── CARGAR ALERTAS ─────────────────────────────────────────────────────────
  cargarAlertas(): void {
    if (!this.authService.usuarioActual()) return;
    this.cargando.set(true);
    this.alertaService.obtenerAlertaUsuario().subscribe({
      next: (res) => {
        this.alertas.set(res.datos.map(a => this.enriquecer(a)));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las alertas.');
        this.cargando.set(false);
      }
    });
  }

// ── ENRIQUECER ALERTA CON NOMBRE RUTA ─────────────────────────────────────────────────────────
  private enriquecer(a: Alerta): AlertaEnriquecida {
    const ruta = this.rutas().find(r => r.id === a.route_id);
    const nombre = a.ruta?.nombre || ruta?.nombre
      || (a.ruta ? `${a.ruta.origin_text} a ${a.ruta.dest_text}` : null)
      || ruta?.origin_text
      || 'Ruta #' + a.route_id;
    return { ...a, rutaNombre: nombre };
  }

// ── OBTENER NOMBRE RUTA POR ID ─────────────────────────────────────────────────────────
  private getRutaNombre(routeId: number): string {
    const ruta = this.rutas().find(r => r.id === routeId);
    return ruta?.nombre || ruta?.origin_text || 'Ruta #' + routeId;
  }

// ── CONSULTAR TRÁFICO ─────────────────────────────────────────────────────────
  consultarTrafico(): void {
    if (!this.fechaAlerta() || !this.horaAlerta()) return;
    this.consultando.set(true);
    this.prediccion.set(null);
    this.error.set('');
    this.alertaService.predecirTrafico(this.fechaAlerta(), this.horaAlerta()).subscribe({
      next: (res) => { this.prediccion.set(res); this.consultando.set(false); },
      error: () => {
        this.error.set('No se pudo consultar el trafico. Esta activo el servidor PC1?');
        this.consultando.set(false);
      }
    });
  }

  crearAlerta(): void {
    const routeId = this.routeIdSeleccionado();
    if (!routeId || !this.fechaAlerta() || !this.horaAlerta()) return;
    this.creando.set(true);
    this.error.set('');
    const forDatetime = this.fechaAlerta() + ' ' + this.horaAlerta() + ':00';
    const pred = this.prediccion();

    // Guardar predicción en Laravel si existe (fire-and-forget, no bloquea la alerta)
    if (pred) {
      this.alertaService.guardarPrediccion({
        route_id:    routeId,
        resultado:   JSON.stringify(pred),
        ml_model_id: 'fastapi-v1'
      }).subscribe({ error: () => {} });
    }

    this.alertaService.crearAlerta({ route_id: routeId, for_datetime: forDatetime }).subscribe({
      next: (res) => {
        const nueva: AlertaEnriquecida = {
          ...res.datos,
          rutaNombre: this.getRutaNombre(routeId),
        };
        this.alertas.update(lista => [nueva, ...lista]);
        this.exito.set('Alerta creada correctamente.');
        this.prediccion.set(null);
        this.routeIdSeleccionado.set(null);
        this.fechaAlerta.set('');
        this.horaAlerta.set('');
        this.creando.set(false);
        setTimeout(() => this.exito.set(''), 4000);
      },
      error: () => {
        this.error.set('No se pudo crear la alerta.');
        this.creando.set(false);
      }
    });
  }

  desactivarAlerta(alerta: AlertaEnriquecida): void {
    this.desactivando.set(alerta.id);
    this.error.set('');
    this.alertaService.desactivarAlerta(alerta.route_id).subscribe({
      next: () => {
        this.alertas.update(lista =>
          lista.map(a => a.route_id === alerta.route_id ? { ...a, status: 'inactiva' } : a)
        );
        this.exito.set('Alerta desactivada.');
        this.desactivando.set(null);
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: () => {
        this.error.set('No se pudo desactivar la alerta.');
        this.desactivando.set(null);
      }
    });
  }
}
