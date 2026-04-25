import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, signal } from '@angular/core';
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

  rutas = signal<MiRuta[]>([]);
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
    this.mapa?.remove();
    this.mapa = null;

    this.mapboxService.calcularRuta(this.coordOrigen()!, this.coordDestino()!).subscribe({
      next: info => {
        this.rutaInfo.set(info);
        this.calculandoRuta.set(false);
        setTimeout(() => this.inicializarMapa(info), 150);
      },
      error: () => { this.calculandoRuta.set(false); }
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
      center: this.coordOrigen()!,
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

      new mapboxgl.Marker({ color: '#16a34a' }).setLngLat(this.coordOrigen()!).addTo(this.mapa!);
      new mapboxgl.Marker({ color: '#dc2626' }).setLngLat(this.coordDestino()!).addTo(this.mapa!);

      const coords = info.geometry.coordinates as [number, number][];
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      this.mapa!.fitBounds(bounds, { padding: 40 });
    });
  }
 
  cargarRutasUsuario(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.rutaService.obtenerRutas().subscribe({
      next: (rutas: Ruta[]) => {
        console.log('Rutas recibidas:', rutas); // Log temporal para depuración
        this.rutas.set(rutas.map(r => ({
          id: r.id,
          nombre: r.nombre ?? 'Sin nombre',
          origen: r.origin_text,
          destino: r.dest_text,
          horaSalida: r.hora_salida ?? '',
          pasaPorM30: r.pasa_por_m30,
          alertasActivas: true,
          dias: 'Días: lunes a viernes'
        })));
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
    // Inicializar mapa vacío cuando el modal termine de renderizarse
    setTimeout(() => this.inicializarMapaVacio(), 200);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.guardandoRuta.set(false);
    try { this.mapa?.remove(); } catch (_) {}
    this.mapa = null;
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
          // Cerrar modal primero (antes de tocar el mapa)
          this.mostrarModal.set(false);
          this.guardandoRuta.set(false);

          // Destruir mapa de forma segura
          try { this.mapa?.remove(); } catch (_) {}
          this.mapa = null;
          this.rutaInfo.set(null);
          this.coordOrigen.set(null);
          this.coordDestino.set(null);
          this.sugerenciasOrigen.set([]);
          this.sugerenciasDestino.set([]);
          this.nuevaRuta = { nombre: '', origen: '', destino: '', horaSalida: '' };

          // Añadir ruta al array
          const r = res?.data;
          if (r) {
            this.rutas.update(list => [{
              id: r.id,
              nombre: r.nombre ?? 'Sin nombre',
              origen: r.origin_text,
              destino: r.dest_text,
              horaSalida: r.hora_salida ?? '',
              pasaPorM30: r.pasa_por_m30,
              alertasActivas: true,
              dias: 'Días: lunes a viernes'
            }, ...list]);
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