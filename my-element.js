import {
  LitElement,
  html,
  css
} from 'lit-element';
import 'mapbox-gl';

export class MyElement extends LitElement {
  static get styles() {
    return css `
    `;
  }

  static get properties() {
    return {
      map: { type: Object },
    };
  }

  constructor() {
    super();
    this.map = null;
  }

  firstUpdated() {
    this._loadMapDefaultConfig();
    this._load2dModeConfig();
  }

  _loadMapDefaultConfig() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2llemgiLCJhIjoiY2pxeG5yNHhqMDBuZzN4cHA4ZGNwY2l3OCJ9.T2B6-B6EMW6u9XmjO4pNKw';
    this.map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/dark-v10',
      // center: [4.954842, 52.327806], // 1112XJ, Diemen
      center: [-122.463, 37.7648], // San Fransisco
      zoom: 12,
      pitch: 0,
      pitchWithRotate: false, // disable 3d rotation in 2d mode
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    // location search with mapbox-gl-geocoder
    this.map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
    );
    
    // The 'building' layer in the mapbox-streets vector source contains building-height
    // data from OpenStreetMap.
    this.map.on('load', function () {
      // Insert the layer beneath any symbol layer.
      // var layers = map.getStyle().layers;
      var layers = this.getStyle().layers;
    
      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      this.addLayer({
          'id': 'all-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
    
            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.4
          }
        },
        labelLayerId
      );
    });
  }

  _load2dModeConfig() {
    this.map.on('load', function () {
      /* Sample feature from the `examples.8fgz4egr` tileset:
      {
      "type": "Feature",
      "properties": {
      "ethnicity": "White"
      },
      "geometry": {
      "type": "Point",
      "coordinates": [ -122.447303, 37.753574 ]
      }
      }
      */
      this.addSource('ethnicity', {
        type: 'vector',
        url: 'mapbox://examples.8fgz4egr'
      });
      this.addLayer({
        'id': 'population',
        'type': 'circle',
        'source': 'ethnicity',
        'source-layer': 'sf2010',
        'paint': {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            'base': 1.75,
            'stops': [
              [12, 2],
              [22, 180]
            ]
          },
          // color circles by ethnicity, using a match expression
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
          'circle-color': [
            'match',
            ['get', 'ethnicity'],
            'White',
            '#fbb03b',
            'Black',
            '#223b53',
            'Hispanic',
            '#e55e5e',
            'Asian',
            '#3bb2d0',
            /* other */
            '#ccc'
          ]
        }
      });
    });
  }

  render() {
    return html `
    `;
  }
}

window.customElements.define('my-element', MyElement);