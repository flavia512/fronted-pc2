import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MapboxFeature {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export interface RouteInfo {
  pasamPorM30: boolean;
  duracionMinutos: number;
  geometry: GeoJSON.LineString;
}

@Injectable({ providedIn: 'root' })
export class MapboxService {
  private readonly token = environment.mapboxToken;
  private readonly M30_KEYWORDS = ['m-30', 'm30', 'calle 30'];

  constructor(private http: HttpClient) {}

  // Autocompletado de direcciones (geocoding)
  buscarDireccion(query: string): Observable<MapboxFeature[]> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    return this.http.get<any>(url, {
      params: {
        access_token: this.token,
        language: 'es',
        country: 'es',
        types: 'address,place',
        limit: '5'
      }
    }).pipe(map(res => res.features as MapboxFeature[]));
  }

  // Calcular ruta entre dos puntos y detectar si pasa por M-30
  calcularRuta(origen: [number, number], destino: [number, number]): Observable<RouteInfo> {
    const coords = `${origen[0]},${origen[1]};${destino[0]},${destino[1]}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`;
    return this.http.get<any>(url, {
      params: {
        access_token: this.token,
        geometries: 'geojson',
        steps: 'true',
        language: 'es'
      }
    }).pipe(map(res => {
      const route = res.routes[0];
      const steps: any[] = route.legs[0].steps;

      const pasaPorM30 = steps.some((step: any) => {
        const nombre = (step.name || '').toLowerCase();
        return this.M30_KEYWORDS.some(k => nombre.includes(k));
      });

      return {
        pasamPorM30: pasaPorM30,
        duracionMinutos: Math.round(route.duration / 60),
        geometry: route.geometry as GeoJSON.LineString
      };
    }));
  }
}
