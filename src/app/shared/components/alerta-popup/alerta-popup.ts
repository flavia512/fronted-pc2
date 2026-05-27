import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../../../core/services/alerta.service';
import { AuthService } from '../../../core/services/auth.service';
import { Alerta } from '../../../core/models/alerta.model';

@Component({
  selector: 'app-alerta-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-popup.html',
  styleUrl: './alerta-popup.scss'
})
export class AlertaPopup implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private authService   = inject(AuthService);

  visible              = signal(false);
  cargandoPrediccion   = signal(false);
  desactivando         = signal(false);
  alertaActual         = signal<Alerta | null>(null);
  prediccion           = signal<{
    nivel_gravedad: number;
    descripcion: string;
    recomendacion: string;
    color: string;
    minutos_antes: number;
  } | null>(null);

  private intervalo?: ReturnType<typeof setInterval>;
  private autoClose?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.verificarAlertas();
    this.intervalo = setInterval(() => this.verificarAlertas(), 60_000);
  }

  private verificarAlertas(): void {
    const user = this.authService.usuarioActual();
    if (!user || this.visible()) return;

    this.alertaService.obtenerAlertaUsuario().subscribe({
      next: (res) => {
        const ahora      = new Date();
        const hoy        = ahora.toISOString().slice(0, 10);
        const minAhora   = ahora.getHours() * 60 + ahora.getMinutes();

        const alerta = res.alertas.find(a => {
          if (a.status !== 'activa') return false;
          const fechaInicio = a.for_datetime.slice(0, 10);
          if (hoy < fechaInicio) return false;
          // Leer hora directamente del string para evitar conversion UTC+offset
          const timePart  = a.for_datetime.replace('T', ' ').split(' ')[1] || '00:00:00';
          const [alertHh, alertMm] = timePart.split(':').map(Number);
          const minAlerta = alertHh * 60 + alertMm;
          const minAviso  = minAlerta - 60; // avisar 1 hora antes
          const diff      = minAhora - minAviso;
          if (diff < -10 || diff > 10) return false;
          if (localStorage.getItem('alerta_ok_' + a.id + '_' + hoy)) return false;
          return true;
        });

        if (alerta) this.mostrarPopup(alerta);
      }
    });
  }

  private mostrarPopup(alerta: Alerta): void {
    this.alertaActual.set(alerta);
    this.prediccion.set(null);
    this.visible.set(true);
    // Auto-cierre tras 2 minutos sin interacción
    if (this.autoClose) clearTimeout(this.autoClose);
    this.autoClose = setTimeout(() => this.cerrar(), 120_000);
    // Extraer hora del string sin conversion de zona horaria
    const timePart = alerta.for_datetime.replace('T', ' ').split(' ')[1] || '00:00:00';
    const hora = timePart.slice(0, 5); // "HH:MM"
    const hoy  = new Date().toISOString().slice(0, 10);
    this.cargandoPrediccion.set(true);
    this.alertaService.predecirTrafico(hoy, hora).subscribe({
      next:  (p) => { this.prediccion.set(p); this.cargandoPrediccion.set(false); },
      error: ()  => this.cargandoPrediccion.set(false)
    });
  }

  cerrar(): void {
    if (this.autoClose) { clearTimeout(this.autoClose); this.autoClose = undefined; }
    const a = this.alertaActual();
    if (a) {
      const hoy = new Date().toISOString().slice(0, 10);
      localStorage.setItem('alerta_ok_' + a.id + '_' + hoy, '1');
    }
    this.visible.set(false);
    this.alertaActual.set(null);
    this.prediccion.set(null);
  }

  desactivarAlerta(): void {
    const a = this.alertaActual();
    if (!a) return;
    this.desactivando.set(true);
    this.alertaService.desactivarAlerta(a.route_id).subscribe({
      next:  () => { this.desactivando.set(false); this.cerrar(); },
      error: () =>   this.desactivando.set(false)
    });
  }

  getNombreRuta(a: Alerta): string {
    if (a.ruta) return a.ruta.nombre || a.ruta.origin_text + ' a ' + a.ruta.dest_text;
    return 'Ruta #' + a.route_id;
  }

  getHora(a: Alerta): string {
    // Extraer directamente del string para evitar desfase UTC
    const timePart = a.for_datetime.replace('T', ' ').split(' ')[1] || '00:00:00';
    return timePart.slice(0, 5);
  }

  getFechaInicio(a: Alerta): string {
    return a.for_datetime.slice(0, 10);
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
    if (this.autoClose) clearTimeout(this.autoClose);
  }
}
