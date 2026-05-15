import { Component, OnInit, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { User } from '../../core/models/user.model';
import { AdminService } from '../../core/services/admin.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva } from '../../core/models/reserva.model';
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  chartRoles: any;
  chartEstados: any;
  chartReservas: any;
  private userService = inject(AdminService);
  private reservaService = inject(ReservaService);

  // USERS
  usuarios = signal<User[]>([]);
  buscando: string = '';

  // RESERVAS
  reservas = signal<Reserva[]>([]);

  rutaSeleccionadaId: number | null = null;

  // UI STATE
  cargando = signal(false);
  error = signal('');
  exito = signal('');

  ngOnInit(): void {
    this.cargarUsuarios();
  }


  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');
    this.userService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.crearGraficos();
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar usuarios');
        this.cargando.set(false);
      }
    });
  }
  crearGraficos(): void {

    const usuarios = this.usuarios();

 //grafico
    const admins = usuarios.filter(u => u.rol === 'admin').length;
    const normales = usuarios.filter(u => u.rol !== 'admin').length;

    if (this.chartRoles) {
      this.chartRoles.destroy();
    }

    this.chartRoles = new Chart('chartRoles', {

      type: 'pie',

      data: {
        labels: ['Admins', 'Usuarios'],
        datasets: [{
          data: [admins, normales],
          backgroundColor: [
            '#ff6384',
            '#36a2eb'
          ]
        }]
      }
    });

//grafico
    const activos = usuarios.filter(u => u.is_active).length;
    const inactivos = usuarios.filter(u => !u.is_active).length;

    if (this.chartEstados) {
      this.chartEstados.destroy();
    }

    this.chartEstados = new Chart('chartEstados', {

      type: 'doughnut',

      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [activos, inactivos],
          backgroundColor: [
            '#4bc0c0',
            '#ff9f40'
          ]
        }]
      }
    });

   //Grafico
    const letras: any = {};

    usuarios.forEach(u => {

      const inicial = u.full_name.charAt(0).toUpperCase();

      letras[inicial] = (letras[inicial] || 0) + 1;
    });

    if (this.chartReservas) {
      this.chartReservas.destroy();
    }

    this.chartReservas = new Chart('chartIniciales', {

      type: 'bar',

      data: {
        labels: Object.keys(letras),
        datasets: [{
          label: 'Usuarios',
          data: Object.values(letras),
          backgroundColor: '#9966ff'
        }]
      },

      options: {
        responsive: true
      }
    });
  }
  get usuariosFiltrados(): User[] {
    if (!this.buscando.trim()) return this.usuarios();

    const termino = this.buscando.toLowerCase();

    return this.usuarios().filter(u =>
      u.full_name.toLowerCase().includes(termino) ||
      u.email.toLowerCase().includes(termino)
    );
  }

  toggleEstado(usuario: User): void {
    const nuevoEstado = !usuario.is_active;

    this.userService.updateUser(usuario.id, { is_active: nuevoEstado }).subscribe({
      next: () => {
        usuario.is_active = nuevoEstado;
        this.exito.set('Estado actualizado correctamente');
      },
      error: () => {
        this.error.set('Error actualizando usuario');
      }
    });
  }

  eliminarUsuario(usuario: User): void {
    if (!confirm(`¿Eliminar a ${usuario.full_name}?`)) return;

    this.userService.deleteUser(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(list =>
          list.filter(u => u.id !== usuario.id)
        );

        this.exito.set('Usuario eliminado correctamente');
      },
      error: () => {
        this.error.set('Error eliminando usuario');
      }
    });
  }

  limpiarBusqueda(): void {
    this.buscando = '';
  }


  cargarReservasPorRuta(rutaId: number): void {
    this.cargando.set(true);
    this.rutaSeleccionadaId = rutaId;
    this.error.set('');

    this.reservaService.reservasPorRuta(rutaId).subscribe({
      next: (res) => {
        this.reservas.set(res.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error cargando reservas');
        this.reservas.set([]);
        this.cargando.set(false);
      }
    });
  }
  oscuro(): void {
    document.body.classList.add('dark-theme');
  }

  claro(): void {
    document.body.classList.remove('dark-theme');
  }
}
