import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  obtenerConfig(clave: string): Observable<string> {
    return this.http
      .get<{ exito: boolean; mensaje: string; datos: { clave: string; valor: string } }>(
        `${this.base}/configuracion/${clave}`
      )
      .pipe(map(res => res.datos?.valor ?? ''));
  }

  actualizarConfig(clave: string, valor: string): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.put<{ exito: boolean; mensaje: string }>(
      `${this.base}/admin/configuracion/${clave}`,
      { valor }
    );
  }
}
