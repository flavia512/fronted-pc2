import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-crear-viaje',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './crear-viaje.html',
  styleUrl: './crear-viaje.scss'
})
export class CrearViaje {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      origin: ['', Validators.required],
      destiny: ['', Validators.required],
      seats_total: [null, [Validators.required, Validators.min(1)]],
      // Controles visuales para armar el datetime
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const formValues = this.form.value;

      // Formateo del datetime para Laravel (YYYY-MM-DD HH:mm:ss)
      const formattedDatetime = `${formValues.fecha} ${formValues.hora}:00`;

      // Payload final exacto para el backend
      const payloadViaje = {
        origin: formValues.origin,
        destiny: formValues.destiny,
        seats_total: formValues.seats_total,
        seats_available: formValues.seats_total, // Por defecto, todos los asientos están disponibles al crear
        trip_datetime: formattedDatetime
        // Nota: Faltará agregar driver_user_id y route_id en el servicio
      };

      console.log('Payload listo para enviar:', payloadViaje);

      // Simulación de carga
      setTimeout(() => {
        this.loading = false;
      }, 1500);
    } else {
      this.form.markAllAsTouched();
    }
  }
}