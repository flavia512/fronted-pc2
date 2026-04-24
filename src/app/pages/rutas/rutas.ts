import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';
import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { MapboxService, MapboxFeature, RouteInfo } from '../../core/services/mapbox.service';
import { RutaService } from '../../core/services/ruta.service';
import { Ruta } from '../../core/models/ruta.model';
import { environment } from '../../../environments/environment';

export interface Prediccion {
  estado: 'Fluido' | 'Tráfico denso' | 'Atasco';
  retrasoMinutos: number;
  horaRecomendada: string;
  explicacion: string;
}

export interface MiRuta {
  id: number;
  nombre: string;
  origen: string;
  destino: string;
  horaSalida: string;
  pasaPorM30: boolean;
  alertasActivas: boolean;
  dias: string;
  prediccion?: Prediccion;
}

@Component({
  selector: 'app-rutas',
  imports: [CommonModule, FormsModule],
  templateUrl: './rutas.html',
  styleUrl: './rutas.scss'
})
export class Rutas implements OnInit, OnDestroy {
  @ViewChild('mapaContainer') mapaContainer!: ElementRef;

  rutas: MiRuta[] = [];
  cargando = true;
  mostrarModal = false;
  guardandoRuta = false;

  // Centro de Madrid por defecto
  private readonly MADRID_CENTER: [number, number] = [-3.7038, 40.4168];

  nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '' };

  // Autocomplete
  sugerenciasOrigen: MapboxFeature[] = [];
  sugerenciasDestino: MapboxFeature[] = [];
  coordOrigen: [number, number] | null = null;
  coordDestino: [number, number] | null = null;

  // Ruta calculada
  rutaInfo: RouteInfo | null = null;
  calculandoRuta = false;

  private mapa: mapboxgl.Map | null = null;
  private origenSubject = new Subject<string>();
  private destinoSubject = new Subject<string>();

  constructor(
    private mapboxService: MapboxService,
    private rutaService: RutaService
  ) {}

  ngOnInit(): void {
    this.cargarRutasUsuario();

    this.origenSubject.pipe(
      debounceTime(300),
      switchMap(q => q.length > 2 ? this.mapboxService.buscarDireccion(q) : of([]))
    ).subscribe(r => this.sugerenciasOrigen = r);

    this.destinoSubject.pipe(
      debounceTime(300),
      switchMap(q => q.length > 2 ? this.mapboxService.buscarDireccion(q) : of([]))
    ).subscribe(r => this.sugerenciasDestino = r);
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.origenSubject.complete();
    this.destinoSubject.complete();
  }

  onOrigenInput(): void {
    this.coordOrigen = null;
    this.rutaInfo = null;
    this.origenSubject.next(this.nuevaRuta.origen);
  }

  onDestinoInput(): void {
    this.coordDestino = null;
    this.rutaInfo = null;
    this.destinoSubject.next(this.nuevaRuta.destino);
  }

  seleccionarOrigen(feature: MapboxFeature): void {
    this.nuevaRuta.origen = feature.place_name;
    this.coordOrigen = feature.center;
    this.sugerenciasOrigen = [];
    this.intentarCalcularRuta();
  }

  seleccionarDestino(feature: MapboxFeature): void {
    this.nuevaRuta.destino = feature.place_name;
    this.coordDestino = feature.center;
    this.sugerenciasDestino = [];
    this.intentarCalcularRuta();
  }

  intentarCalcularRuta(): void {
    if (!this.coordOrigen || !this.coordDestino) return;
    this.calculandoRuta = true;
    this.rutaInfo = null;
    this.mapa?.remove();
    this.mapa = null;

    this.mapboxService.calcularRuta(this.coordOrigen, this.coordDestino).subscribe({
      next: info => {
        this.rutaInfo = info;
        this.calculandoRuta = false;
        setTimeout(() => this.inicializarMapa(info), 150);
      },
      error: () => { this.calculandoRuta = false; }
    });
  }

  inicializarMapaVacio(): void {
    if (!this.mapaContainer?.nativeElement) return;
    this.mapa?.remove();
    (mapboxgl as any).accessToken = environment.mapboxToken;
    this.mapa = new mapboxgl.Map({
      container: this.mapaContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.MADRID_CENTER,
      zoom: 11
    });
    this.mapa.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
  }

  inicializarMapa(info: RouteInfo): void {
    if (!this.mapaContainer?.nativeElement) return;
    this.mapa?.remove();

    (mapboxgl as any).accessToken = environment.mapboxToken;
    this.mapa = new mapboxgl.Map({
      container: this.mapaContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.coordOrigen!,
      zoom: 11
    });

    this.mapa.on('load', () => {
      this.mapa!.addSource('ruta', {
        type: 'geojson',
        data: { type: 'Feature', geometry: info.geometry, properties: {} }
      });
      this.mapa!.addLayer({
        id: 'ruta-line', type: 'line', source: 'ruta',
        paint: { 'line-color': '#1d4ed8', 'line-width': 4, 'line-opacity': 0.9 }
      });

      new mapboxgl.Marker({ color: '#16a34a' }).setLngLat(this.coordOrigen!).addTo(this.mapa!);
      new mapboxgl.Marker({ color: '#dc2626' }).setLngLat(this.coordDestino!).addTo(this.mapa!);

      const coords = info.geometry.coordinates as [number, number][];
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      this.mapa!.fitBounds(bounds, { padding: 40 });
    });
  }

  cargarRutasUsuario(): void {
    this.cargando = true;
    this.rutaService.obtenerRutas().subscribe({
      next: (rutas: Ruta[]) => {
        this.rutas = rutas.map(r => ({
          id: r.id,
          nombre: r.nombre ?? 'Sin nombre',
          origen: r.origin_text,
          destino: r.dest_text,
          horaSalida: r.hora_salida ?? '',
          pasaPorM30: r.pasa_por_m30,
          alertasActivas: true,
          dias: 'Días: lunes a viernes'
        }));
        this.cargando = false;
      },
      error: () => {
        // Sin token o sin backend: mostramos vacío
        this.rutas = [];

        this.cargando = false;
      }
    });
  }

  eliminarRuta(id: number): void {
    this.rutaService.eliminarRuta(id).subscribe({
      next: () => this.rutas = this.rutas.filter(r => r.id !== id),
      error: () => this.rutas = this.rutas.filter(r => r.id !== id)
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    // Inicializar mapa vacío cuando el modal termine de renderizarse
    setTimeout(() => this.inicializarMapaVacio(), 200);
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mapa?.remove();
    this.mapa = null;
    this.rutaInfo = null;
    this.coordOrigen = null;
    this.coordDestino = null;
    this.sugerenciasOrigen = [];
    this.sugerenciasDestino = [];
    this.nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '' };
  }

  guardarRutaBackend(): void {
    if (!this.coordOrigen || !this.coordDestino || !this.rutaInfo) return;
    this.guardandoRuta = true;

    const payload = {
      nombre: this.nuevaRuta.nombre || null,
      origin_text: this.nuevaRuta.origen,
      origin_lat: this.coordOrigen[1],
      origin_lng: this.coordOrigen[0],
      dest_text: this.nuevaRuta.destino,
      dest_lat: this.coordDestino[1],
      dest_lng: this.coordDestino[0],
      hora_salida: this.nuevaRuta.horaSalida || null,
      duration_min: this.rutaInfo.duracionMinutos,
      pasa_por_m30: this.rutaInfo.pasamPorM30
    };

    this.rutaService.crearRuta(payload).subscribe({
      next: (res) => {
        const r = res.data;
        this.rutas.unshift({
          id: r.id,
          nombre: r.nombre ?? 'Sin nombre',
          origen: r.origin_text,
          destino: r.dest_text,
          horaSalida: r.hora_salida ?? '',
          pasaPorM30: r.pasa_por_m30,
          alertasActivas: true,
          dias: 'Días: lunes a viernes'
        });
        this.guardandoRuta = false;
        this.cerrarModal();
      },
      error: () => { this.guardandoRuta = false; }
    });
  }
}