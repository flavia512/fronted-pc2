import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../shared/components/header/header';
import { User } from '../../core/models/user.model';
import { AdminService } from '../../core/services/admin.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva } from '../../core/models/reserva.model';
import { ViajeCompartidoService, ViajeCompartido } from '../../core/services/viaje-compartido.service';
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
  @ViewChild('canvasRoles', { static: true }) canvasRoles!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasEstados', { static: true }) canvasEstados!: ElementRef<HTMLCanvasElement>;
  chartRoles: any;
  chartEstados: any;
  private userService = inject(AdminService);
  private reservaService = inject(ReservaService);
  private viajeService = inject(ViajeCompartidoService);
  private configuracionService = inject(ConfiguracionService);

  // SOPORTE
  linkSoporte = signal('');
  guardandoSoporte = signal(false);
  mensajeSoporte = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  private soporteTimeout: any;

  // USERS
  usuarios = signal<User[]>([]);
  buscando: string = '';

  // RESERVAS POR VIAJE COMPARTIDO
  reservas = signal<Reserva[]>([]);
  viajes = signal<ViajeCompartido[]>([]);
  viajeId: number | null = null;

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
    this.cargarViajes();
    this.configuracionService.obtenerConfig('soporte_link').subscribe({
      next: (valor) => this.linkSoporte.set(valor),
      error: () => {}
    });
  }


  cargarEstadisticas(): void {
    this.userService.getEstadisticas().subscribe({
      next: (stats) => {
        this.estadisticas.set(stats);
        if (this.usuarios().length > 0) setTimeout(() => this.crearGraficos(), 0);
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
        setTimeout(() => this.crearGraficos(), 0);
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

    const admins   = stats?.admins   ?? usuarios.filter(u => u.rol === 'admin').length;
    const normales = stats ? stats.total - stats.admins : usuarios.filter(u => u.rol !== 'admin').length;
    const activos  = stats?.activos  ?? usuarios.filter(u => u.is_active).length;
    const inactivos = stats ? stats.total - stats.activos : usuarios.filter(u => !u.is_active).length;

    // ── Gráfico: Roles ────────────────────────────────────────────
    if (this.chartRoles) this.chartRoles.destroy();
    this.chartRoles = new Chart(this.canvasRoles.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Admins', 'Usuarios'],
        datasets: [{
          data: [admins, normales],
          backgroundColor: ['#f59e0b', '#3b82f6'],
          borderColor: ['#fff', '#fff'],
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        cutout: '68%',
        maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 18, font: { size: 13 }, usePointStyle: true }
          },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` } }
        }
      }
    });

    // ── Gráfico: Estados ──────────────────────────────────────────
    if (this.chartEstados) this.chartEstados.destroy();
    this.chartEstados = new Chart(this.canvasEstados.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [activos, inactivos],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderColor: ['#fff', '#fff'],
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        cutout: '68%',
        maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 18, font: { size: 13 }, usePointStyle: true }
          }
        }
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


  cargarViajes(): void {
    this.viajeService.listarViajes().subscribe({
      next: (res) => this.viajes.set(res.data),
      error: () => {}
    });
  }

  cargarReservasPorViaje(id: number): void {
    this.cargando.set(true);
    this.viajeId = id;
    this.error.set('');

    this.viajeService.obtenerViaje(id).subscribe({
      next: (res) => {
        this.reservas.set((res.data?.reservas ?? []) as unknown as Reserva[]);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error cargando reservas del viaje');
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
    this.configuracionService.actualizarConfig('soporte_link', this.linkSoporte()).subscribe({
      next: () => {
        this.guardandoSoporte.set(false);
        this.mostrarMensajeSoporte('exito', 'Link de soporte actualizado');
      },
      error: () => {
        this.guardandoSoporte.set(false);
        this.mostrarMensajeSoporte('error', 'Error al guardar el link');
      }
    });
  }

  private mostrarMensajeSoporte(tipo: 'exito' | 'error', texto: string): void {
    this.mensajeSoporte.set({ tipo, texto });
    if (this.soporteTimeout) clearTimeout(this.soporteTimeout);
    this.soporteTimeout = setTimeout(() => this.mensajeSoporte.set(null), 4000);
  }

}

