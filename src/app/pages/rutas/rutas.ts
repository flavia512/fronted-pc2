import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';

// Reducir el worker pool a 1 para evitar la race condition de glyph loading en Mapbox GL JS v3.
// Debe ser antes de cualquier instancia de Map. Si ya hay otro Map creado en otro contexto,
// esta línea no tiene efecto (la Dispatcher pool es un singleton).
(mapboxgl as any).workerCount = 1;

import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { MapboxService, MapboxFeature, RouteInfo } from '../../core/services/mapbox.service';
import { RutaService } from '../../core/services/ruta.service';
import { Ruta } from '../../core/models/ruta.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rutas',
  imports: [CommonModule, FormsModule],
  templateUrl: './rutas.html',
  styleUrl: './rutas.scss'
})
export class Rutas implements OnInit, OnDestroy {
  @ViewChild('mapaContainer') mapaContainer!: ElementRef;

  rutas = signal<Ruta[]>([]);
  cargando = signal(true);
  errorCarga = signal(false);
  mostrarModal = signal(false);
  guardandoRuta = signal(false);

  // Toast de feedback
  toast = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  private toastTimeout: any = null;

  // Centro de Madrid por defecto
  private readonly MADRID_CENTER: [number, number] = [-3.7038, 40.4168];

  nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '' };

  // Autocomplete
  sugerenciasOrigen = signal<MapboxFeature[]>([]);
  sugerenciasDestino = signal<MapboxFeature[]>([]);
  coordOrigen = signal<[number, number] | null>(null);
  coordDestino = signal<[number, number] | null>(null);

  // Ruta calculada
  rutaInfo = signal<RouteInfo | null>(null);
  calculandoRuta = signal(false);

  private mapa: mapboxgl.Map | null = null;
  private origenSubject = new Subject<string>();
  private destinoSubject = new Subject<string>();

  constructor(
    private mapboxService: MapboxService,
    private rutaService: RutaService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cargarRutasUsuario();

    this.origenSubject.pipe(
      debounceTime(300),
      switchMap(q => q.length > 2 ? this.mapboxService.buscarDireccion(q) : of([]))
    ).subscribe(r => this.sugerenciasOrigen.set(r));

    this.destinoSubject.pipe(
      debounceTime(300),
      switchMap(q => q.length > 2 ? this.mapboxService.buscarDireccion(q) : of([]))
    ).subscribe(r => this.sugerenciasDestino.set(r));
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.origenSubject.complete();
    this.destinoSubject.complete();
  }

  onOrigenInput(): void {
    this.coordOrigen.set(null);
    this.rutaInfo.set(null);
    this.origenSubject.next(this.nuevaRuta.origen);
  }

  onDestinoInput(): void {
    this.coordDestino.set(null);
    this.rutaInfo.set(null);
    this.destinoSubject.next(this.nuevaRuta.destino);
  }

  seleccionarOrigen(feature: MapboxFeature): void {
    this.nuevaRuta.origen = feature.place_name;
    this.coordOrigen.set(feature.center);
    this.sugerenciasOrigen.set([]);
    this.intentarCalcularRuta();
  }

  seleccionarDestino(feature: MapboxFeature): void {
    this.nuevaRuta.destino = feature.place_name;
    this.coordDestino.set(feature.center);
    this.sugerenciasDestino.set([]);
    this.intentarCalcularRuta();
  }

  intentarCalcularRuta(): void {
    if (!this.coordOrigen() || !this.coordDestino()) return;
    this.calculandoRuta.set(true);
    this.rutaInfo.set(null);

    this.mapboxService.calcularRuta(this.coordOrigen()!, this.coordDestino()!).subscribe({
      next: info => {
        this.rutaInfo.set(info);
        this.calculandoRuta.set(false);
        setTimeout(() => this.inicializarMapa(info), 150);
      },
      error: () => { this.calculandoRuta.set(false); }
    });
  }

  inicializarMapa(info: RouteInfo): void {
    if (!this.mapaContainer?.nativeElement) return;

    // Lógica reutilizable para añadir/actualizar la ruta en el mapa
    const renderRoute = () => {
      if (!this.mapa) return;
      try {
        if (this.mapa.getSource('ruta')) {
          (this.mapa.getSource('ruta') as mapboxgl.GeoJSONSource).setData(
            { type: 'Feature', geometry: info.geometry, properties: {} }
          );
        } else {
          this.mapa.addSource('ruta', {
            type: 'geojson',
            data: { type: 'Feature', geometry: info.geometry, properties: {} }
          });
          this.mapa.addLayer({
            id: 'ruta-line', type: 'line', source: 'ruta',
            paint: { 'line-color': '#1d4ed8', 'line-width': 4, 'line-opacity': 0.9 }
          });
          new mapboxgl.Marker({ color: '#16a34a' }).setLngLat(this.coordOrigen()!).addTo(this.mapa);
          new mapboxgl.Marker({ color: '#dc2626' }).setLngLat(this.coordDestino()!).addTo(this.mapa);
        }
        const coords = info.geometry.coordinates as [number, number][];
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        this.mapa.fitBounds(bounds, { padding: 40 });
      } catch (_) {}
    };

    if (this.mapa) {
      // Mapa ya existe (creado por inicializarMapaVacio u otra llamada anterior)
      this.mapa.resize();
      if (this.mapa.loaded()) {
        renderRoute();
      } else {
        this.mapa.once('load', renderRoute);
      }
      return;
    }

    (mapboxgl as any).accessToken = environment.mapboxToken;
    this.mapa = new mapboxgl.Map({
      container: this.mapaContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.coordOrigen()!,
      zoom: 11
    });
    this.mapa.on('load', renderRoute);
  }
 
  cargarRutasUsuario(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.rutaService.obtenerRutas().subscribe({
      next: (rutas: Ruta[]) => {
        this.rutas.set(rutas);
        this.cargando.set(false);
      },
      error: (err) => {
        this.rutas.set([]);
        this.cargando.set(false);
        this.errorCarga.set(true);
        if (err?.status === 401) {
          this.mostrarToast('error', 'Sesión expirada. Vuelve a iniciar sesión.');
        } else if (err?.status === 0) {
          this.mostrarToast('error', 'No se pudo conectar con el servidor.');
        }
      }
    });
  }

  eliminarRuta(id: number): void {
    const ruta = this.rutas().find(r => r.id === id);
    const nombre = ruta?.nombre || 'esta ruta';
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

    this.rutaService.eliminarRuta(id).subscribe({
      next: () => {
        this.rutas.update(list => list.filter(r => r.id !== id));
        this.mostrarToast('exito', 'Ruta eliminada correctamente');
      },
      error: () => {
        this.mostrarToast('error', 'No se pudo eliminar la ruta. Inténtalo de nuevo.');
      }
    });
  }

  mostrarToast(tipo: 'exito' | 'error', mensaje: string): void {
    this.toast.set({ tipo, mensaje });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.toast.set(null), 5000);
  }

  cerrarToast(): void {
    this.toast.set(null);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  abrirModal(): void {
    this.mostrarModal.set(true);
    if (!this.mapa) {
      // Primera apertura: inicializar mapa vacío para que el canvas esté listo
      setTimeout(() => this.inicializarMapaVacio(), 200);
    } else {
      setTimeout(() => this.mapa?.resize(), 50);
    }
  }

  inicializarMapaVacio(): void {
    if (!this.mapaContainer?.nativeElement) return;
    (mapboxgl as any).accessToken = environment.mapboxToken;
    this.mapa = new mapboxgl.Map({
      container: this.mapaContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.MADRID_CENTER,
      zoom: 11
    });
    this.mapa.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.guardandoRuta.set(false);
    this.rutaInfo.set(null);
    this.coordOrigen.set(null);
    this.coordDestino.set(null);
    this.sugerenciasOrigen.set([]);
    this.sugerenciasDestino.set([]);
    this.nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '' };
  }

  guardarRutaBackend(): void {
    if (!this.coordOrigen() || !this.coordDestino() || !this.rutaInfo()) return;
    this.guardandoRuta.set(true);

    const payload = {
      nombre: this.nuevaRuta.nombre || null,
      origin_text: this.nuevaRuta.origen,
      origin_lat: this.coordOrigen()![1],
      origin_lng: this.coordOrigen()![0],
      dest_text: this.nuevaRuta.destino,
      dest_lat: this.coordDestino()![1],
      dest_lng: this.coordDestino()![0],
      hora_salida: this.nuevaRuta.horaSalida || null,
      duration_min: this.rutaInfo()!.duracionMinutos,
      pasa_por_m30: this.rutaInfo()!.pasamPorM30
    };

    this.rutaService.crearRuta(payload).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.mostrarModal.set(false);
          this.guardandoRuta.set(false);
          this.rutaInfo.set(null);
          this.coordOrigen.set(null);
          this.coordDestino.set(null);
          this.sugerenciasOrigen.set([]);
          this.sugerenciasDestino.set([]);
          this.nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '' };

          // Añadir ruta al array
          const r = res?.data;
          if (r) {
            this.rutas.update(list => [r, ...list]);
          }

          this.mostrarToast('exito', `✓ Ruta "${r?.nombre ?? 'Nueva ruta'}" guardada correctamente`);
        });
      },
      error: (err) => {
        this.guardandoRuta.set(false);
        if (err?.status === 401) {
          this.mostrarToast('error', 'Tu sesión ha expirado. Vuelve a iniciar sesión.');
        } else if (err?.status === 422) {
          this.mostrarToast('error', 'Datos inválidos. Revisa los campos.');
        } else {
          this.mostrarToast('error', 'No se pudo guardar la ruta. Inténtalo de nuevo.');
        }
      }
    });
  }
}