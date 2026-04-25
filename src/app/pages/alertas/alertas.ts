import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService } from '../../core/services/alerta.service';
import { AuthService } from '../../core/services/auth.service';
import { Alerta } from '../../core/models/alerta.model';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss'
})
export class Alertas implements OnInit {
  private alertaService = inject(AlertaService);
  private authService = inject(AuthService);

  alertas = signal<Alerta[]>([]);
  cargando = signal(false);
  error = signal('');
  exito = signal('');

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('No se pudo identificar al usuario.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.alertaService.obtenerAlertaUsuario(user.id).subscribe({
      next: (res) => {
        this.alertas.set(res.alertas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las alertas.');
        this.cargando.set(false);
      }
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
      error: () => {
        this.error.set('No se pudo desactivar la alerta.');
      }
    });
  }
}
