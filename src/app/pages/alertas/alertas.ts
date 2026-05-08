import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaService } from '../../core/services/alerta.service';
import { AuthService } from '../../core/services/auth.service';
import { RutaService } from '../../core/services/ruta.service';
import { Alerta } from '../../core/models/alerta.model';
import { Ruta } from '../../core/models/ruta.model';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class Alertas implements OnInit {
  private alertaService = inject(AlertaService);
  private authService  = inject(AuthService);
  private rutaService  = inject(RutaService);

  // Estado general
  alertas  = signal<Alerta[]>([]);
  rutas    = signal<Ruta[]>([]);
  cargando = signal(false);
  error    = signal('');
  exito    = signal('');

  // Formulario nueva alerta
  routeIdSeleccionado = signal<number | null>(null);
  fechaAlerta = signal('');
  horaAlerta  = signal('');

  // Predicción PC1
  consultando = signal(false);
  prediccion  = signal<{
    nivel_gravedad: number;
    descripcion: string;
    minutos_antes: number;
    recomendacion: string;
    color: string;
  } | null>(null);
  creando = signal(false);

  // Solo rutas que pasan por M-30
  rutasM30 = computed(() => this.rutas().filter(r => r.pasa_por_m30));

  ngOnInit(): void {
    this.cargarAlertas();
    this.cargarRutas();
  }

  cargarRutas(): void {
    this.rutaService.obtenerRutas().subscribe({
      next: (rutas) => this.rutas.set(rutas),
      error: () => {}
    });
  }

  cargarAlertas(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.cargando.set(true);
    this.alertaService.obtenerAlertaUsuario(user.id).subscribe({
      next: (res) => { this.alertas.set(res.alertas); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las alertas.'); this.cargando.set(false); }
    });
  }

  consultarTrafico(): void {
    if (!this.fechaAlerta() || !this.horaAlerta()) return;
    this.consultando.set(true);
    this.prediccion.set(null);
    this.alertaService.predecirTrafico(this.fechaAlerta(), this.horaAlerta()).subscribe({
      next: (res) => { this.prediccion.set(res); this.consultando.set(false); },
      error: () => { this.error.set('No se pudo consultar el tráfico. ¿Está activo el servidor PC1?'); this.consultando.set(false); }
    });
  }

  crearAlerta(): void {
    const routeId = this.routeIdSeleccionado();
    if (!routeId || !this.fechaAlerta() || !this.horaAlerta()) return;
    this.creando.set(true);
    const forDatetime = `${this.fechaAlerta()} ${this.horaAlerta()}:00`;
    this.alertaService.crearAlerta({ route_id: routeId, for_datetime: forDatetime }).subscribe({
      next: (res) => {
        this.alertas.update(lista => [res.alerta, ...lista]);
        this.exito.set('Alerta creada correctamente.');
        this.prediccion.set(null);
        this.routeIdSeleccionado.set(null);
        this.fechaAlerta.set('');
        this.horaAlerta.set('');
        this.creando.set(false);
        setTimeout(() => this.exito.set(''), 4000);
      },
      error: () => { this.error.set('No se pudo crear la alerta.'); this.creando.set(false); }
    });
  }

  desactivarAlerta(alerta: Alerta): void {
    if (!confirm(`¿Desactivar todas las alertas de la ruta #${alerta.route_id}?`)) return;
    this.alertaService.desactivarAlerta(alerta.route_id).subscribe({
      next: () => {
        this.alertas.update(lista =>
          lista.map(a => a.route_id === alerta.route_id ? { ...a, status: 'inactiva' } : a)
        );
        this.exito.set('Alerta desactivada correctamente.');
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: () => this.error.set('No se pudo desactivar la alerta.')
    });
  }
}
