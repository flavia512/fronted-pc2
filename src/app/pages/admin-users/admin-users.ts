import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  private userService = inject(UserService);

  usuarios = signal<User[]>([]);
  cargando = signal(false);
  buscando: string = '';
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
        this.error.set('No se pudo cargar la lista de usuarios.');
        this.cargando.set(false);
      }
    });
  }

  get usuariosFiltrados(): User[] {
    if (!this.buscando.trim()) {
      return this.usuarios();
    }

    const termino = this.buscando.toLowerCase();
    return this.usuarios().filter(
      (u) =>
        u.full_name.toLowerCase().includes(termino) ||
        u.email.toLowerCase().includes(termino)
    );
  }

  toggleEstado(usuario: User): void {
    const nuevoEstado = !usuario.is_active;
    const mensaje = nuevoEstado ? 'activado' : 'desactivado';

    this.userService.updateUser(usuario.id, { is_active: nuevoEstado }).subscribe({
      next: () => {
        usuario.is_active = nuevoEstado;
        this.exito.set(`Usuario ${mensaje} correctamente`);
        setTimeout(() => {
          this.exito.set('');
        }, 3000);
      },
      error: () => {
        this.error.set(`No se pudo ${nuevoEstado ? 'activar' : 'desactivar'} el usuario.`);
      }
    });
  }

  eliminarUsuario(usuario: User): void {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${usuario.full_name}?`)) {
      return;
    }

    this.userService.deleteUser(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(list => list.filter((u) => u.id !== usuario.id));
        this.exito.set('Usuario eliminado correctamente');
        setTimeout(() => {
          this.exito.set('');
        }, 3000);
      },
      error: () => {
        this.error.set('No se pudo eliminar el usuario.');
      }
    });
  }

  limpiarBusqueda(): void {
    this.buscando = '';
  }
}
