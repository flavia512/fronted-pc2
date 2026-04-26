import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViajeCompartidoService } from '../../core/services/viaje-compartido.service';

@Component({
  selector: 'app-crear-viaje',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './crear-viaje.html',
  styleUrl: './crear-viaje.scss'
})
export class CrearViaje {

  private viajeService = inject(ViajeCompartidoService);

  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      driver_user_id: [1, Validators.required],
      route_id: [1, Validators.required],

      origin: ['', Validators.required],
      destiny: ['', Validators.required],

      seats_total: [null, [Validators.required, Validators.min(1)]],

      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const v = this.form.value;

    const trip_datetime = `${v.fecha} ${v.hora}:00`;

    const payload = {
      driver_user_id: v.driver_user_id,
      route_id: v.route_id,

      origin: v.origin,
      destiny: v.destiny,

      trip_datetime: trip_datetime,

      seats_total: v.seats_total,
      seats_available: v.seats_total,

      status: 'activo'
    };

    console.log('PAYLOAD FINAL:', payload);

    this.viajeService.crearViaje(payload).subscribe({
      next: (res) => {
        console.log('Viaje creado correctamente:', res);
        this.loading = false;
        this.form.reset();
      },
      error: (err) => {
        console.error('Error creando viaje:', err);
        this.errorMessage = 'Error al crear el viaje';
        this.loading = false;
      }
    });
  }

}
