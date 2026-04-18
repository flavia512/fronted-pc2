import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UsuarioPerfil {
  nombre: string;
  email: string;
  telefono: string;
  verificado: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  usuario: UsuarioPerfil = {
    nombre: '',
    email: '',
    telefono: '',
    verificado: false
  };

  cargando: boolean = true;
  guardando: boolean = false;

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  // ESTRUCTURA PREPARADA PARA CONEXIÓN BACKEND (GET):
  cargarDatosUsuario(): void {
    this.cargando = true;

    // Simulación de petición al backend
    setTimeout(() => {
      this.usuario = {
        nombre: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        telefono: '+34 600 123 456',
        verificado: true
      };
      this.cargando = false;
    }, 500);
  }

  // ESTRUCTURA PREPARADA PARA ACTUALIZACIÓN BACKEND (PUT/POST):
  guardarCambios(): void {
    this.guardando = true;
    console.log('Datos preparados para actualizar:', this.usuario);

    // Simulación de guardado en el servidor
    setTimeout(() => {
      this.guardando = false;
      // Aquí podrías añadir un toast o notificación de éxito
    }, 1000);
  }
}