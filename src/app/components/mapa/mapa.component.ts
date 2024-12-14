import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl, { Map, NavigationControl } from 'mapbox-gl';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.component.html',
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 64px);
    }
    #mapa {
      width: 100%;
      height: 100%;
    }
    .elevation-popup {
      background: white;
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-size: 14px;
      line-height: 1.4;
    }
    .elevation-popup strong {
      color: #1a73e8;
    }
    .elevation-popup small {
      color: #666;
      display: block;
      margin-top: 4px;
    }
  `]
})
export class MapaComponent implements OnInit {
  map!: Map;
  mostrarElevaciones: boolean = false;
  mostrarContornos: boolean = false;
  mostrarElevacionPuntual: boolean = false;
  elevacionPopup?: mapboxgl.Popup;

  constructor() {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  ngOnInit() {
    this.inicializarMapa();
  }

  inicializarMapa() {
    this.map = new Map({
      container: 'mapa',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [-1.6442, 42.8167],
      zoom: 13,
      pitch: 0,
      bearing: 0
    });

    this.map.on('load', () => {
      this.map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 12
      });

      this.map.setTerrain({ 
        source: 'mapbox-dem',
        exaggeration: 1
      });

      this.map.addSource('elevation-color', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb'
      });

      this.map.addLayer({
        id: 'elevation-color-layer',
        type: 'hillshade',
        source: 'elevation-color',
        layout: {
          visibility: 'none'
        },
        paint: {
          'hillshade-exaggeration': 1,
          'hillshade-illumination-direction': 315,
          'hillshade-highlight-color': '#ffffff',
          'hillshade-shadow-color': '#5a7193',
          'hillshade-accent-color': '#627ba6'
        }
      });

      this.cargarCapaElevaciones();
      this.cargarCapaContornos();
      this.configurarElevacionPuntual();

      this.map.addControl(new NavigationControl({
        visualizePitch: true
      }));

      this.map.setLayoutProperty('building', 'visibility', 'none');
      this.map.setLayoutProperty('poi-label', 'visibility', 'none');
      this.map.setLayoutProperty('road-label', 'visibility', 'none');
    });
  }

  cargarCapaElevaciones() {
    this.map.addSource('elevaciones', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.terrain-rgb'
    });

    this.map.addLayer({
      id: 'hillshading',
      type: 'hillshade',
      source: 'elevaciones',
      layout: {
        visibility: 'none'
      },
      paint: {
        'hillshade-exaggeration': 1.2,
        'hillshade-illumination-direction': 315,
        'hillshade-shadow-color': '#000000',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-accent-color': '#627ba6'
      }
    });
  }

  cargarCapaContornos() {
    this.map.addSource('contornos', {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-terrain-v2'
    });

    this.map.addLayer({
      id: 'contornos-principales',
      type: 'line',
      source: 'contornos',
      'source-layer': 'contour',
      layout: {
        visibility: 'none',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#003366',
        'line-width': 2,
        'line-opacity': 0.8
      },
      filter: ['==', ['%', ['get', 'ele'], 100], 0]
    });

    this.map.addLayer({
      id: 'contornos-secundarios',
      type: 'line',
      source: 'contornos',
      'source-layer': 'contour',
      layout: {
        visibility: 'none',
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#004d99',
        'line-width': 1,
        'line-opacity': 0.6
      },
      filter: ['!=', ['%', ['get', 'ele'], 100], 0]
    });
  }

  configurarElevacionPuntual() {
    this.map.on('click', async (e) => {
      if (!this.mostrarElevacionPuntual) return;

      const coordinates = e.lngLat;
      try {
        // Usar el servicio de terreno de Mapbox
        const query = await fetch(
          `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coordinates.lng},${coordinates.lat}.json?layers=contour&access_token=${environment.mapboxToken}`
        );

        if (!query.ok) {
          throw new Error('Error en la consulta de elevación');
        }

        const data = await query.json();
        
        // Obtener la elevación del primer feature
        if (data.features && data.features.length > 0) {
          const elevation = data.features[0].properties.ele;

          if (this.elevacionPopup) {
            this.elevacionPopup.remove();
          }

          // Crear un nuevo popup con la elevación
          this.elevacionPopup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div class="elevation-popup">
                <strong>Elevación:</strong> ${elevation} metros
                <br>
                <small>Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}</small>
              </div>
            `)
            .addTo(this.map);
        } else {
          console.warn('No se encontraron datos de elevación para este punto');
        }

      } catch (error) {
        console.error('Error al obtener la elevación:', error);
        // Mostrar un popup de error
        if (this.elevacionPopup) {
          this.elevacionPopup.remove();
        }
        this.elevacionPopup = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="elevation-popup">
              <strong style="color: #dc3545;">Error</strong>
              <br>
              <small>No se pudo obtener la elevación para este punto</small>
            </div>
          `)
          .addTo(this.map);
      }
    });
  }

  toggleElevaciones() {
    this.mostrarElevaciones = !this.mostrarElevaciones;
    
    if (this.mostrarElevaciones) {
      this.map.setLayoutProperty('hillshading', 'visibility', 'visible');
      this.map.setLayoutProperty('elevation-color-layer', 'visibility', 'visible');
      
      this.map.easeTo({
        pitch: 35,
        bearing: -15,
        zoom: this.map.getZoom() + 0.3,
        duration: 1500,
        easing: (t) => t * (2 - t)
      });
    } else {
      this.map.setLayoutProperty('hillshading', 'visibility', 'none');
      this.map.setLayoutProperty('elevation-color-layer', 'visibility', 'none');
      
      this.map.easeTo({
        pitch: 0,
        bearing: 0,
        zoom: this.map.getZoom() - 0.3,
        duration: 1500
      });
    }
  }

  toggleContornos() {
    this.mostrarContornos = !this.mostrarContornos;
    const visibility = this.mostrarContornos ? 'visible' : 'none';
    this.map.setLayoutProperty('contornos-principales', 'visibility', visibility);
    this.map.setLayoutProperty('contornos-secundarios', 'visibility', visibility);
  }

  toggleElevacionPuntual() {
    this.mostrarElevacionPuntual = !this.mostrarElevacionPuntual;
    if (!this.mostrarElevacionPuntual && this.elevacionPopup) {
      this.elevacionPopup.remove();
    }
  }

  guardarVista() {
    const center = this.map.getCenter();
    console.log('Vista guardada (simulado):', {
      latitud: center.lat,
      longitud: center.lng,
      zoom: this.map.getZoom(),
      fecha: new Date()
    });
  }
} 