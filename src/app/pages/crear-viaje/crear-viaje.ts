import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ViajeCompartidoService } from '../../core/services/viaje-compartido.service';
import { ViajeCompartido } from '../../core/models/viaje-compartido.model';
import { RutaService } from '../../core/services/ruta.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Ruta } from '../../core/models/ruta.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-crear-viaje',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-viaje.html'
})
export class CrearViaje implements OnInit {
  private fb = inject(FormBuilder);
  private viajeService = inject(ViajeCompartidoService);
  private rutaService = inject(RutaService);
  private reservaService = inject(ReservaService);
  private router = inject(Router);
  private authService = inject(AuthService);

  form: FormGroup;
  misRutas: Ruta[] = [];
  rutaSeleccionada = signal<Ruta | null>(null);

  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  private toastTimeout: any = null;

  misViajes = signal<ViajeCompartido[]>([]);
  cargandoViajes = signal(false);
  eliminando = signal<number | null>(null);
  gestionandoReserva = signal<number | null>(null);

  constructor() {
    this.form = this.fb.group({
      route_id: [null, Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      seats_total: [null, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
  }

  ngOnInit() {
    if (!this.authService.estaAutenticado()) {
      this.mostrarToast('error', 'Para publicar un viaje tienes que iniciar sesión');

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

      return;
    }

    this.rutaService.obtenerRutas().subscribe({
      next: (res) => {
        this.misRutas = res.datos ?? [];
      },
      error: () => {
        this.mostrarToast('error', 'No se pudieron cargar tus rutas guardadas.');
      }
    });

    this.cargarMisViajes();

    this.form.get('route_id')!.valueChanges.subscribe((id: number | null) => {
      const ruta = id ? this.misRutas.find(r => r.id === Number(id)) ?? null : null;
      this.rutaSeleccionada.set(ruta);

      if (ruta?.hora_salida) {
        const hora = ruta.hora_salida.substring(0, 5);
        this.form.get('hora')!.setValue(hora);
      }
    });
  }

  mostrarToast(tipo: 'exito' | 'error', mensaje: string): void {
    this.toast.set({ tipo, mensaje });

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => this.toast.set(null), 3000);
  }

  cerrarToast(): void {
    this.toast.set(null);

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  onSubmit() {
    if (!this.authService.estaAutenticado()) {
      this.mostrarToast('error', 'Para publicar un viaje tienes que iniciar sesión');

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);

      return;
    }

    if (this.form.valid) {
      const formValues = this.form.value;
      const ruta = this.rutaSeleccionada();
      const userId = this.authService.usuarioActual()?.id;

      if (!ruta || !userId) {
        this.mostrarToast('error', 'No se pudo preparar el viaje. Selecciona una ruta e inicia sesión.');
        return;
      }

      const horaLimpia = String(formValues.hora).substring(0, 5);
      const formattedDatetime = `${formValues.fecha} ${horaLimpia}:00`;

      const payloadViaje = {
        driver_user_id: userId,
        route_id: Number(formValues.route_id),
        origin: ruta.origin_text,
        destiny: ruta.dest_text,
        trip_datetime: formattedDatetime,
        seats_total: formValues.seats_total,
        seats_available: formValues.seats_total
      };

      this.viajeService.crearViaje(payloadViaje).subscribe({
        next: () => {
          this.form.reset();
          this.rutaSeleccionada.set(null);
          this.mostrarToast('exito', '¡Viaje publicado con éxito!');
          this.cargarMisViajes();
        },
        error: () => {
          this.mostrarToast('error', 'Error al publicar el viaje. Revisa tu conexión.');
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  cargarMisViajes(): void {
    this.cargandoViajes.set(true);

    this.viajeService.misViajes().subscribe({
      next: ({ datos }) => {
        this.misViajes.set(datos ?? []);
        this.cargandoViajes.set(false);
      },
      error: () => {
        this.cargandoViajes.set(false);
      }
    });
  }

  cancelarViaje(id: number): void {
    this.eliminando.set(id);
    this.viajeService.eliminarViaje(id).subscribe({
      next: () => {
        this.misViajes.update(viajes => viajes.filter(v => v.id !== id));
        this.eliminando.set(null);
        this.mostrarToast('exito', 'Viaje cancelado correctamente.');
      },
      error: () => {
        this.eliminando.set(null);
        this.mostrarToast('error', 'Error al cancelar el viaje.');
      }
    });
  }

  nombreRuta(routeId: number): string {
    const ruta = this.misRutas.find(r => r.id === routeId);
    return ruta?.nombre ?? '';
  }

  cambiarEstadoReserva(reservaId: number, status: 'confirmed' | 'cancelled', viajeId: number): void {
    this.gestionandoReserva.set(reservaId);
    this.reservaService.actualizarReserva(reservaId, { status }).subscribe({
      next: () => {
        this.misViajes.update(viajes =>
          viajes.map(v => {
            if (v.id !== viajeId) return v;
            return {
              ...v,
              reservas: (v.reservas ?? []).map(r =>
                r.id === reservaId ? { ...r, status } : r
              )
            };
          })
        );
        this.gestionandoReserva.set(null);
        const msg = status === 'confirmed' ? 'Reserva confirmada.' : 'Reserva rechazada.';
        this.mostrarToast('exito', msg);
      },
      error: () => {
        this.gestionandoReserva.set(null);
        this.mostrarToast('error', 'Error al actualizar la reserva.');
      }
    });
  }
}
