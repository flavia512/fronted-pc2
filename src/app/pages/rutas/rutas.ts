import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // IMPORTANTE: Necesario para el formulario del modal

// Estructura de datos preparada para coincidir con la respuesta de tu API en Laravel
export interface Prediccion {
  estado: 'Fluido' | 'Tráfico denso' | 'Atasco';
  retrasoMinutos: number;
  horaRecomendada: string;
  explicacion: string;
}

export interface MiRuta {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  horaSalida: string;
  pasaPorM30: boolean;
  alertasActivas: boolean;
  dias: string;
  prediccion?: Prediccion;
}

@Component({
  selector: 'app-rutas',
  imports: [CommonModule, FormsModule], // Añadido FormsModule
  templateUrl: './rutas.html',
  styleUrl: './rutas.scss'
})
export class Rutas implements OnInit {
  rutas: MiRuta[] = [];
  cargando: boolean = true;

  // Variables para controlar el Modal
  mostrarModal: boolean = false;
  guardandoRuta: boolean = false;

  // Objeto preparado para enviar al backend
  nuevaRuta = {
    nombre: '',
    origen: '',
    destino: '',
    horaSalida: '',
    pasaPorM30: false
  };

  ngOnInit(): void {
    this.cargarRutasUsuario();
  }

  cargarRutasUsuario(): void {
    this.cargando = true;

    // SIMULACIÓN DE RESPUESTA DE 1 SEGUNDO
    setTimeout(() => {
      // Dejamos el array vacío para simular que el usuario aún no tiene rutas
      // y forzar que se vea el "estado vacío" invitando a crear una.
      this.rutas = [];

      this.cargando = false;
    }, 1000);
  }

  eliminarRuta(id: number): void {
    console.log(`Petición DELETE preparada para la ruta ID: ${id}`);
    this.rutas = this.rutas.filter(ruta => ruta.id !== id);
  }

  // --- LÓGICA DEL MODAL ---
  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    // Limpiamos el formulario al cerrar
    this.nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '', pasaPorM30: false };
  }

  guardarRutaBackend(): void {
    this.guardandoRuta = true;
    console.log('Datos preparados para POST en Laravel:', this.nuevaRuta);

    // Simulamos el tiempo de guardado en la base de datos
    setTimeout(() => {
      const rutaCreada: MiRuta = {
        id: Math.random(),
        nombre: this.nuevaRuta.nombre || 'Mi nueva ruta',
        origen: this.nuevaRuta.origen,
        destino: this.nuevaRuta.destino,
        horaSalida: this.nuevaRuta.horaSalida,
        pasaPorM30: this.nuevaRuta.pasaPorM30,
        alertasActivas: true,
        dias: 'Días: lunes a viernes'
      };

      // Añadimos la ruta creada visualmente a la lista
      this.rutas.unshift(rutaCreada);

      this.guardandoRuta = false;
      this.cerrarModal();
    }, 1000);
  }
}