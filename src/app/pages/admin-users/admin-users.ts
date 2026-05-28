import { Component, OnInit, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../core/models/user.model';
import { AdminService } from '../../core/services/admin.service';
import { Reserva } from '../../core/models/reserva.model';
import { ViajeCompartidoService } from '../../core/services/viaje-compartido.service';
import { ViajeCompartido } from '../../core/models/viaje-compartido.model';
import {Chart, registerables} from 'chart.js';// librería para gráficos
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
  // Referencias a los canvas en el html para gráficos
  @ViewChild('canvasRoles',   { static: false }) canvasRoles?:   ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasEstados', { static: false }) canvasEstados?: ElementRef<HTMLCanvasElement>;
  chartRoles: any;
  chartEstados: any;
  private userService = inject(AdminService);
  private viajeService = inject(ViajeCompartidoService);
  private configuracionService = inject(ConfiguracionService);

  // SOPORTE
  linkSoporte = signal('');
  guardandoSoporte = signal(false);
  mensajeSoporte = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  private soporteTimeout: any;

  // LOGO — alias a la señal compartida del servicio
  logoUrl = this.configuracionService.logoUrl;
  logoPreview = signal<string | null>(null);
  logoFile = signal<File | null>(null);
  subiendoLogo = signal(false);
  mensajeLogo = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  private logoTimeout: any;

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

  constructor() {
    effect(() => {
      const users = this.usuarios();
      this.estadisticas(); 
      if (users.length === 0) return;
      setTimeout(() => this.crearGraficos(), 0);
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarEstadisticas();
    this.cargarViajes();
    this.configuracionService.obtenerConfig('soporte_link').subscribe({
      next: (res) => this.linkSoporte.set(res.datos?.valor ?? ''),
      error: () => {}
    });
    this.configuracionService.cargarLogo();
  }


  cargarEstadisticas(): void {
    this.userService.obtenerEstadisticas().subscribe({
      next: (res) => this.estadisticas.set(res.datos),
      error: () => {}
    });
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');
    this.userService.obtenerTodos().subscribe({
      next: (res) => {
        this.usuarios.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar usuarios');
        this.cargando.set(false);
      }
    });
  }

// ── CREA LOS 2 GRÁFICOS ─────────────────────────────────────────────────────────
  crearGraficos(): void {
    if (!this.canvasRoles || !this.canvasEstados) return;
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
        cutout: '68%', // agujero central del donut 
        maintainAspectRatio: false,
        animation: { duration: 700 }, // animacion de entrada de 700ms 
        plugins: {
          legend: {// configuración de la leyenda debajo del gráfico
            position: 'bottom',
            labels: { padding: 18, font: { size: 13 }, usePointStyle: true }
          },
          // personalización del tooltip para mostrar "Admin: 5" en lugar de solo "5"
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
        cutout: '68%', // agujero central del donut 
        maintainAspectRatio: false,
        animation: { duration: 700 }, // animacion de entrada de 700ms 
        plugins: {
          legend: {// configuración de la leyenda debajo del gráfico
            position: 'bottom',
            labels: { padding: 18, font: { size: 13 }, usePointStyle: true }
          }
        }
      }
    });
  }
// ── FILTRADO DE USUARIOS ─────────────────────────────────────────
  get usuariosFiltrados(): User[] {
    if (!this.buscando.trim()) return this.usuarios();

    const termino = this.buscando.toLowerCase();

    return this.usuarios().filter(u =>
      u.full_name.toLowerCase().includes(termino) ||
      u.email.toLowerCase().includes(termino)
    );
  }
// ── TOGGLE ESTADO (ACTIVO/INACTIVO) ─────────────────────────────────────────
  toggleEstado(usuario: User): void {
    const nuevoEstado = !usuario.is_active;

    this.userService.actualizarUsuario(usuario.id, { is_active: nuevoEstado }).subscribe({
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

  // ── ELIMINAR USUARIO ─────────────────────────────────────────
  eliminarUsuario(usuario: User): void {
    if (!confirm(`¿Eliminar a ${usuario.full_name}?`)) return;

    this.userService.eliminarUsuario(usuario.id).subscribe({
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
// ─ LIMPIAR BÚSQUEDA ─────────────────────────────────────────
  limpiarBusqueda(): void {
    this.buscando = '';
  }

// ── VIAJES ─────────────────────────────────────────
  cargarViajes(): void {
    this.viajeService.listarViajes().subscribe({
      next: (res) => this.viajes.set(res.datos ?? []),
      error: () => {}
    });
  }

// ── RESERVAS POR VIAJE ─────────────────────────────────────────
  cargarReservasPorViaje(id: number): void {
    this.viajeId = id;
    const viaje = this.viajes().find(v => v.id === id);
    this.reservas.set((viaje?.reservas ?? []) as unknown as Reserva[]);
  }

// ── ABRIR MODAL   ─────────────────────────────────────────────────────────
  abrirModalCrear(): void {
    this.formCrear = { full_name: '', email: '', password: '', rol: 'user' };
    this.error.set('');
    this.exito.set('');
    this.mostrarModalCrear.set(true);
  }

// ── CERRAR MODAL ─────────────────────────────────────────────────────────
  cerrarModalCrear(): void {
    this.mostrarModalCrear.set(false);
  }

// ── CREAR USUARIO ─────────────────────────────────────────────────────────
  crearUsuario(): void {
    if (!this.formCrear.full_name.trim() || !this.formCrear.email.trim() || !this.formCrear.password.trim()) {
      this.error.set('Rellena todos los campos obligatorios');
      return;
    }
    this.guardandoCrear.set(true);
    this.error.set('');
    this.userService.crearUsuario(this.formCrear).subscribe({
      next: (res) => {
        const nuevo = res.datos;
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

// ── MODAL EDITAR USUARIO ─────────────────────────────────────────────────────────
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

// ── CERRAR MODAL EDITAR USUARIO ─────────────────────────────────────────────────────────
  cerrarModalEditar(): void {
    this.mostrarModalEditar.set(false);
    this.usuarioEditando.set(null);
  }

// ── GUARDAR EDICIÓN USUARIO ─────────────────────────────────────────────────────────
  guardarEdicion(): void {
    const usuario = this.usuarioEditando();
    if (!usuario) return;
    this.guardandoEditar.set(true);
    this.error.set('');
    this.userService.actualizarUsuario(usuario.id, this.formEditar).subscribe({
      next: (res) => {
        const actualizado = res.datos;
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

// ── GUARDAR LINK SOPORTE ─────────────────────────────────────────────────────────
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

// ── MENSAJE TEMPORAL SOPORTE ─────────────────────────────────────────────────────────
  private mostrarMensajeSoporte(tipo: 'exito' | 'error', texto: string): void {
    this.mensajeSoporte.set({ tipo, texto });
    if (this.soporteTimeout) clearTimeout(this.soporteTimeout);
    this.soporteTimeout = setTimeout(() => this.mensajeSoporte.set(null), 4000);
  }

// ── SELECCIONAR LOGO ─────────────────────────────────────────────────────────
  onLogoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.logoFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

// ── SUBIR LOGO ─────────────────────────────────────────────────────────
  subirLogo(): void {
    const file = this.logoFile();
    if (!file) return;
    this.subiendoLogo.set(true);
    this.configuracionService.subirLogo(file).subscribe({
      next: (res) => {
        this.subiendoLogo.set(false);
        this.configuracionService.logoUrl.set(res.datos.url);
        this.logoPreview.set(null);
        this.logoFile.set(null);
        this.mostrarMensajeLogo('exito', 'Logo actualizado correctamente');
      },
      error: () => {
        this.subiendoLogo.set(false);
        this.mostrarMensajeLogo('error', 'Error al subir el logo');
      }
    });
  }

// ── MENSAJE TEMPORAL LOGO ─────────────────────────────────────────────────────────
  private mostrarMensajeLogo(tipo: 'exito' | 'error', texto: string): void {
    this.mensajeLogo.set({ tipo, texto });
    if (this.logoTimeout) clearTimeout(this.logoTimeout);
    this.logoTimeout = setTimeout(() => this.mensajeLogo.set(null), 4000);
  }

}

