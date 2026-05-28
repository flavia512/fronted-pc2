import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  /** Estado global del logo — controlado por admin */
  readonly logoUrl = signal('');

  /** Enlace de soporte técnico — controlado por admin */
  readonly linkSoporte = signal('');

  cargarLogo(): void {
    this.obtenerConfig('logo_url').subscribe({
      next: (res) => this.logoUrl.set(res.datos?.valor ?? ''),
      error: () => {}
    });
  }

  cargarSoporte(): void {
    this.obtenerConfig('soporte_link').subscribe({
      next: (res) => this.linkSoporte.set(res.datos?.valor ?? ''),
      error: () => {}
    });
  }

  obtenerConfig(clave: string): Observable<{ exito: boolean; datos: { clave: string; valor: string } }> {
    return this.http.get<{ exito: boolean; datos: { clave: string; valor: string } }>(
      `${this.base}/configuracion/${clave}`
    );
  }

  actualizarConfig(clave: string, valor: string): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.put<{ exito: boolean; mensaje: string }>(
      `${this.base}/admin/configuracion/${clave}`,
      { valor }
    );
  }

  subirLogo(file: File): Observable<{ exito: boolean; datos: { url: string } }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ exito: boolean; datos: { url: string } }>(
      `${this.base}/admin/configuracion/logo`,
      formData
    );
  }
}
