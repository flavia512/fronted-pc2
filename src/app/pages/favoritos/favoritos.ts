import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritoService } from '../../core/services/favorito.service';
import { AuthService } from '../../core/services/auth.service';
import { Favorito } from '../../core/models/favorito.model';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.scss'
})
export class Favoritos implements OnInit {
  private favoritoService = inject(FavoritoService);
  private authService     = inject(AuthService);

  favoritos   = signal<Favorito[]>([]);
  cargando    = signal(false);
  error       = signal('');
  exito       = signal('');
  eliminando  = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.cargando.set(true);
    this.error.set('');
    this.favoritoService.listarFavoritos().subscribe({
      next: (res) => { this.favoritos.set(res.favoritos); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los favoritos.'); this.cargando.set(false); }
    });
  }

  eliminarFavorito(fav: Favorito): void {
    if (!confirm('¿Quitar esta ruta de favoritos?')) return;
    const user = this.authService.currentUser();
    if (!user) return;

    this.eliminando.set(fav.route_id);
    this.favoritoService.eliminarFavorito(user.id, fav.route_id).subscribe({
      next: () => {
        this.favoritos.update(lista => lista.filter(f => f.route_id !== fav.route_id));
        this.exito.set('Ruta eliminada de favoritos.');
        this.eliminando.set(null);
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: () => {
        this.error.set('No se pudo eliminar el favorito.');
        this.eliminando.set(null);
      }
    });
  }
}
