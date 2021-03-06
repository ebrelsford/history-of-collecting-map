import classNames from 'classnames';
import uniqBy from 'lodash.uniqby';
import React, { Component } from 'react';
import ReactMapboxGl, { Layer, Source, ZoomControl } from 'react-mapbox-gl';
import turfBbox from '@turf/bbox';
import Sifter from './EnhancedSifter';
import Popup from './Popup.js';
import './CollectingMap.css';
import { MAPBOX_ACESS_TOKEN, MAPBOX_STYLE } from './config.js';

const Map = ReactMapboxGl({
  accessToken: MAPBOX_ACESS_TOKEN,
  maxZoom: 9
});

const COLLECTING_FEATURES_LAYER_ID = 'collecting-features';

export default class CollectingMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: [0, 0],
      filteredData: [],
      map: null,
      mouseOverFeature: false,
      popupCoordinates: null,
      selectedFeatures: [],
      zoom: [1]
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.filters !== this.props.filters) {
      const { data, filters } = nextProps;
      const { map } = this.state;
      const filteredData = this.filterData(data, filters);

      let bbox, bounds;
      if (filteredData.features.length) {
        bbox = turfBbox(filteredData);
        bounds = [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]]
        ];
      }

      if (bounds && map) {
        map.fitBounds(bounds, {
          maxZoom: 8,
          padding: 50
        });
      }

      this.setState({ filteredData });
    }
  }

  filterData(data, filters) {
    const { decadeRange, gender, role, search } = filters;
    const filteredData = { type: 'FeatureCollection', features: [] };
    if (!data) return filteredData;
    if (!this.sifter) {
      this.sifter = new Sifter(data.features);
    }

    let sifterResults = [];
    if (search && search !== '') {
      let searchTerm = search.toLowerCase();
      let conjunction = 'or';

      // Use AND conjunction if it looks like that's what the user is doing
      if (searchTerm.indexOf(' and ') >= 0) {
        searchTerm = searchTerm.replace(/ and /gi, ' ');
        conjunction = 'and';
      }

      // Get matching indices
      sifterResults = this.sifter.search(searchTerm, {
        conjunction,
        fields: ['properties.Name', 'properties.City', 'properties.Description'],
        nesting: true
      }).items.map(item => item.id);
    }

    filteredData.features = data.features.filter((feature, index) => {
      if (gender && gender !== 'any') {
        if (feature.properties.Gender !== gender) return false;
      }
      if (role && role !== 'any') {
        if (feature.properties.Role.indexOf(role) < 0) return false;
      }
      if (decadeRange && decadeRange.length === 2) {
        if (!feature.properties.Decades) return false;
        const validDecades = feature.properties.Decades.filter(d => d >= decadeRange[0] && d < decadeRange[1]);
        if (validDecades.length === 0) return false;
      }
      if (search && search !== '') {
        if (sifterResults.indexOf(index) < 0) return false;
      }

      return true;
    });

    return filteredData;
  }

  handleMapClick(map, event) {
    const { point } = event;
    const features = this.getFeaturesAtPoint(map, point);

    let popupCoordinates, selectedFeatures;
    if (features.length > 0) {
      const { coordinates } = features[0].geometry;
      popupCoordinates = { lng: coordinates[0], lat: coordinates[1] };
      selectedFeatures = uniqBy(features, f => f.properties.DealerID);
    }

    this.setState({ popupCoordinates, selectedFeatures });
  }

  handleMouseMove(map, event) {
    const { mouseOverFeature } = this.state;
    const { point } = event;
    const features = this.getFeaturesAtPoint(map, point);
    if (!mouseOverFeature && features.length) {
      this.setState({ mouseOverFeature: true });
    }
    else if (mouseOverFeature && features.length === 0) {
      this.setState({ mouseOverFeature: false });
    }
  }

  handleMoveEnd(map) {
    const oldCenter = this.state.center;
    const oldZoom = this.state.zoom;
    const center = map.getCenter();
    const zoom = [map.getZoom()];
    if (oldCenter[0] !== center[0] || oldCenter[1] !== center[1] || oldZoom[0] !== zoom[0]) {
      this.setState({ center, zoom });
    }
  }

  getFeaturesAtPoint(map, point) {
    const bbox = [
      [point.x - 1, point.y - 1],
      [point.x + 1, point.y + 1]
    ];
    if (!map.getLayer(COLLECTING_FEATURES_LAYER_ID)) {
      return [];
    }
    return map.queryRenderedFeatures(bbox, { layers: [COLLECTING_FEATURES_LAYER_ID] });
  }

  render() {
    const { center, filteredData, mouseOverFeature, popupCoordinates, selectedFeatures, zoom } = this.state;

    return (
      <div className={classNames('CollectingMap', { 'mouse-over-feature': mouseOverFeature })}>
        <Map
          // eslint-disable-next-line
          style={MAPBOX_STYLE}
          containerStyle={{
            height: '100vh',
            width: '100%'
          }}
          center={center}
          zoom={zoom}
          onClick={this.handleMapClick.bind(this)}
          onMouseMove={this.handleMouseMove.bind(this)}
          onMoveEnd={this.handleMoveEnd.bind(this)}
          onStyleLoad={map => this.setState({ map })}
        >
          <ZoomControl/>

          <Source
            id='collecting'
            geoJsonSource={{
              type: 'geojson',
              data: filteredData
            }}
          />
          <Layer
            id='collecting-heatmap'
            paint={{
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(244, 244, 244, 0)',
                0.2, 'rgba(244, 244, 244, 0.5)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgba(253, 181, 255, 0.4)',
                0.8, 'rgba(253, 181, 255, 0.6)',
                1, 'rgba(253, 181, 255, 0.8)'
              ],
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 5,
                15, 20
              ],
            }}
            sourceId='collecting'
            type='heatmap'
          />

          <Layer
            id={COLLECTING_FEATURES_LAYER_ID}
            paint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 2,
                15, 10
              ],
              'circle-color': '#3a3a3a',
              'circle-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.5,
                15, 1
              ]
            }}
            sourceId='collecting'
            type='circle'
          />

          {(popupCoordinates && selectedFeatures.length > 0) ? (
            <Popup
              close={() => this.setState({ popupCoordinates: null, selectedFeatures: [] })}
              coordinates={popupCoordinates}
              features={selectedFeatures}
              offset={{
                'bottom-left': [12, 0],  'bottom': [0, 0], 'bottom-right': [-12, 0]
              }}
            ></Popup>
          ) : null}
        </Map>
      </div>
    );
  }
}
