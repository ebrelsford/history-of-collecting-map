import classNames from 'classnames';
import uniqBy from 'lodash.uniqby';
import React, { Component } from 'react';
import ReactMapboxGl, { GeoJSONLayer, Layer, Source, ZoomControl } from 'react-mapbox-gl';
import turfBbox from '@turf/bbox';
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
      mouseOverFeature: false,
      popupCoordinates: null,
      selectedFeatures: [],
      zoom: [1]
    };
  }

  filterData(data) {
    const { filters } = this.props;
    const { decades, gender, role } = filters;
    const filteredData = { type: 'FeatureCollection', features: [] };
    if (!data) return filteredData;
    let name = filters.name.toLowerCase();

    filteredData.features = data.features.filter(feature => {
      if (gender && gender !== 'any') {
        if (feature.properties.Gender !== gender) return false;
      }
      if (role && role !== 'any') {
        if (feature.properties.Role.indexOf(role) < 0) return false;
      }
      if (decades && decades !== 'any') {
        if (feature.properties.Decades.indexOf(decades) < 0) return false;
      }
      if (name && name !== '') {
        if (feature.properties.Name.toLowerCase().indexOf(name) < 0) return false;
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
      selectedFeatures = uniqBy(features, f => f.properties.ID);
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
    const { center, mouseOverFeature, popupCoordinates, selectedFeatures, zoom } = this.state;
    const { data } = this.props;
    const filteredData = this.filterData(data);

    let bbox, bounds;
    if (filteredData.features.length) {
      bbox = turfBbox(filteredData);
      bounds = [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]]
      ];
    }

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
          fitBounds={bounds}
          fitBoundsOptions={{
            maxZoom: 8,
            padding: 50
          }}
          onClick={this.handleMapClick.bind(this)}
          onMouseMove={this.handleMouseMove.bind(this)}
          onMoveEnd={this.handleMoveEnd.bind(this)}
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

          <GeoJSONLayer
            data={filteredData}
            circlePaint={{
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 3,
                15, 8
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
            layerOptions={{
              id: COLLECTING_FEATURES_LAYER_ID
            }}
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
