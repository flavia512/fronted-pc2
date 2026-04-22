import { Component, OnInit, inject } from '@angular/core';
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

  usuarios: User[] = [];
  cargando: boolean = false;
  buscando: string = '';
  error: string = '';
  exito: string = '';

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.userService.getAllUsers().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la lista de usuarios.';
        this.cargando = false;
      }
    });
  }

  get usuariosFiltrados(): User[] {
    if (!this.buscando.trim()) {
      return this.usuarios;
    }

    const termino = this.buscando.toLowerCase();
    return this.usuarios.filter(
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
        this.exito = `Usuario ${mensaje} correctamente`;
        setTimeout(() => {
          this.exito = '';
        }, 3000);
      },
      error: () => {
        this.error = `No se pudo ${nuevoEstado ? 'activar' : 'desactivar'} el usuario.`;
      }
    });
  }

  eliminarUsuario(usuario: User): void {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${usuario.full_name}?`)) {
      return;
    }

    this.userService.deleteUser(usuario.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id);
        this.exito = 'Usuario eliminado correctamente';
        setTimeout(() => {
          this.exito = '';
        }, 3000);
      },
      error: () => {
        this.error = 'No se pudo eliminar el usuario.';
      }
    });
  }

  limpiarBusqueda(): void {
    this.buscando = '';
  }
}
