import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva } from '../../core/models/reserva.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {

  private userService = inject(UserService);
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
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar usuarios');
        this.cargando.set(false);
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
}
