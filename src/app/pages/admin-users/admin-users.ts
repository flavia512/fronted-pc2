import { Component, OnInit, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../shared/components/header/header';
import { User } from '../../core/models/user.model';
import { AdminService } from '../../core/services/admin.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva } from '../../core/models/reserva.model';
import {Chart, registerables} from 'chart.js';
import { ConfiguracionService } from '../../core/services/configuracion.service';

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
  private configuracionService = inject(ConfiguracionService);
  linkSoporte = signal('');
  guardandoSoporte = signal(false);

  // USERS
  usuarios = signal<User[]>([]);
  buscando: string = '';

  // RESERVAS
  reservas = signal<Reserva[]>([]);

  rutaSeleccionadaId: number | null = null;

  // ESTADÍSTICAS (backend)
  estadisticas = signal<{ total: number; admins: number; activos: number } | null>(null);

  // UI STATE
  cargando = signal(false);
  error = signal('');
  exito = signal('');

  // MODAL CREAR
  mostrarModalCrear = signal(false);
  formCrear = { full_name: '', email: '', password: '', rol: 'user' };
  guardandoCrear = signal(false);

  // MODAL EDITAR
  mostrarModalEditar = signal(false);
  usuarioEditando = signal<User | null>(null);
  formEditar: { full_name: string; email: string; rol: string; is_active: boolean } = { full_name: '', email: '', rol: 'user', is_active: true };
  guardandoEditar = signal(false);

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEstadisticas();
    this.configuracionService.obtenerConfig('soporte_link').subscribe({
      next: (valor) => this.linkSoporte.set(valor),
      error: () => {}
    });
  }


  cargarEstadisticas(): void {
    this.userService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas.set(stats);
        if (this.usuarios().length > 0) this.crearGraficos();
      },
      error: () => {} // no bloquea la UI
    });
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
    const stats    = this.estadisticas();

    // Usar datos del backend si disponibles, sino calcular localmente
    const admins   = stats?.admins   ?? usuarios.filter(u => u.rol === 'admin').length;
    const normales = stats ? stats.total - stats.admins : usuarios.filter(u => u.rol !== 'admin').length;

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
    const activos   = stats?.activos ?? usuarios.filter(u => u.is_active).length;
    const inactivos  = stats ? stats.total - stats.activos : usuarios.filter(u => !u.is_active).length;

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
        this.cargarEstadisticas();
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
        this.cargarEstadisticas();
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
  // ── CREAR USUARIO ─────────────────────────────────────────────────────────
  abrirModalCrear(): void {
    this.formCrear = { full_name: '', email: '', password: '', rol: 'user' };
    this.error.set('');
    this.exito.set('');
    this.mostrarModalCrear.set(true);
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear.set(false);
  }

  crearUsuario(): void {
    if (!this.formCrear.full_name.trim() || !this.formCrear.email.trim() || !this.formCrear.password.trim()) {
      this.error.set('Rellena todos los campos obligatorios');
      return;
    }
    this.guardandoCrear.set(true);
    this.error.set('');
    this.userService.crearUsuario(this.formCrear).subscribe({
      next: (nuevo) => {
        this.usuarios.update(list => [...list, nuevo]);
        this.cargarEstadisticas();
        this.exito.set(`Usuario ${nuevo.full_name} creado correctamente`);
        this.mostrarModalCrear.set(false);
        this.guardandoCrear.set(false);
      },
      error: () => {
        this.error.set('Error creando usuario. El email puede estar en uso.');
        this.guardandoCrear.set(false);
      }
    });
  }

  // ── EDITAR USUARIO ─────────────────────────────────────────────────────────
  abrirModalEditar(usuario: User): void {
    this.usuarioEditando.set(usuario);
    this.formEditar = {
      full_name: usuario.full_name,
      email: usuario.email,
      rol: usuario.rol,
      is_active: usuario.is_active
    };
    this.error.set('');
    this.exito.set('');
    this.mostrarModalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar.set(false);
    this.usuarioEditando.set(null);
  }

  guardarEdicion(): void {
    const usuario = this.usuarioEditando();
    if (!usuario) return;
    this.guardandoEditar.set(true);
    this.error.set('');
    this.userService.updateUser(usuario.id, this.formEditar).subscribe({
      next: (actualizado) => {
        this.usuarios.update(list => list.map(u => u.id === actualizado.id ? actualizado : u));
        this.cargarEstadisticas();
        this.exito.set('Usuario actualizado correctamente');
        this.mostrarModalEditar.set(false);
        this.usuarioEditando.set(null);
        this.guardandoEditar.set(false);
      },
      error: () => {
        this.error.set('Error actualizando usuario');
        this.guardandoEditar.set(false);
      }
    });
  }
  cambiarIcono(): void {
    Header.icono = 'bi-truck';
  }




  guardarLinkSoporte(): void {
    this.guardandoSoporte.set(true);
    this.error.set('');
    this.configuracionService.actualizarConfig('soporte_link', this.linkSoporte()).subscribe({
      next: () => {
        this.exito.set('Link de soporte actualizado');
        this.guardandoSoporte.set(false);
      },
      error: () => {
        this.error.set('Error guardando el link de soporte');
        this.guardandoSoporte.set(false);
      }
    });
  }
}
