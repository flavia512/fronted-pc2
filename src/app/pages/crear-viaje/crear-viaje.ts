import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ViajeCompartidoService } from '../../core/services/viaje-compartido.service';
import { RutaService } from '../../core/services/ruta.service';

@Component({
  selector: 'app-crear-viaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-viaje.html',
  styleUrl: './crear-viaje.scss'
})
export class CrearViaje implements OnInit {
  private fb = inject(FormBuilder);
  private viajeService = inject(ViajeCompartidoService);
  private rutaService = inject(RutaService);
  private router = inject(Router);

  form: FormGroup;
  loading = false;
  cargandoRutas = true;
  misRutas: any[] = [];

  // Sistema de notificaciones (Toast)
  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  private toastTimeout: any = null;

  constructor() {
    this.form = this.fb.group({
      route_id: [null, Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      seats_total: [null, [Validators.required, Validators.min(1), Validators.max(8)]]
    });
  }

  ngOnInit() {
    // 1. Cargar las rutas del usuario al iniciar la pantalla
    this.rutaService.obtenerRutas().subscribe({
      next: (rutas) => {
        this.misRutas = rutas.map(r => ({
          id: r.id,
          origen: r.origin_text,
          destino: r.dest_text
        }));
        this.cargandoRutas = false;
      },
      error: (err) => {
        this.cargandoRutas = false;
        console.error('Error al cargar las rutas:', err);
        this.mostrarToast('error', 'No se pudieron cargar tus rutas guardadas.');
      }
    });
  }

  // --- MÉTODOS DEL TOAST ---
  mostrarToast(tipo: 'exito' | 'error', mensaje: string): void {
    this.toast.set({ tipo, mensaje });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.set(null), 3000);
  }

  cerrarToast(): void {
    this.toast.set(null);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  // --- ENVÍO DEL FORMULARIO ---
  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const formValues = this.form.value;
      const formattedDatetime = `${formValues.fecha} ${formValues.hora}:00`;

      // Payload limpio y estructurado con el ID de la ruta
      const payloadViaje = {
        route_id: Number(formValues.route_id),
        trip_datetime: formattedDatetime,
        seats_total: formValues.seats_total,
        seats_available: formValues.seats_total // Mismo valor inicial
      };

      this.viajeService.crearViaje(payloadViaje).subscribe({
        next: () => {
          this.loading = false;
          this.mostrarToast('exito', '¡Viaje publicado con éxito!');

          // Redirigimos a la pantalla principal tras 1.5 segundos
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al crear el viaje:', err);
          this.mostrarToast('error', 'Error al publicar el viaje. Revisa tu conexión.');
        }
      });
    } else {
      // Marcar todos los campos como tocados para que salgan en rojo si faltan datos
      this.form.markAllAsTouched();
    }
  }
}