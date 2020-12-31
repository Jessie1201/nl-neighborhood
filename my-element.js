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
      name: {
        type: String
      },
      count: {
        type: Number
      },
    };
  }

  constructor() {
    super();
    this.name = 'World';
    this.count = 0;
  }

  firstUpdated() {
    this._loadMapConfig();
  }

  _loadMapConfig() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamVzc2llemgiLCJhIjoiY2pxeG5yNHhqMDBuZzN4cHA4ZGNwY2l3OCJ9.T2B6-B6EMW6u9XmjO4pNKw';
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: [-74.0066, 40.7135],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    // location search with mapbox-gl-geocoder
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
    );
    
    // The 'building' layer in the mapbox-streets vector source contains building-height
    // data from OpenStreetMap.
    map.on('load', function () {
      // Insert the layer beneath any symbol layer.
      var layers = map.getStyle().layers;
    
      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }
    
      map.addLayer({
          'id': '3d-buildings',
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
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });
  }

  render() {
    return html `
      <span>test content</span>
    `;
  }
}

window.customElements.define('my-element', MyElement);