import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-crear-viaje',
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
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      asientos: [null, [Validators.required, Validators.min(1)]],
      comentarios: ['']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      console.log('Viaje a publicar:', this.form.value);
      // Simulate API call delay
      setTimeout(() => {
        this.loading = false;
      }, 1500);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
