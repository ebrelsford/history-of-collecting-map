import React, { Component } from 'react';
import { Popup as MapboxPopup } from "react-mapbox-gl";
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './Popup.css';

const MultipleFeatures = ({ features, onSelect }) => {
  const options = features
    .map(feature => ({ label: feature.properties.Name, value: feature.properties.ID }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const location = features[0].properties.City;

  return (
    <div className='Popup-MultipleFeatures'>
      <div>There are {features.length} points around {location}:</div>

      <Select
        onChange={({ value }) => onSelect(features.filter(f => f.properties.ID === value)[0])}
        options={options}
      />
    </div>
  );
};

const condenseText = (text) => {
  const sentences = text.split('. ');
  let condensed = '';
  let i = 0;
  while (i < sentences.length && condensed.length < 100) {
    const sentence = sentences[i].trim()
    if (sentence) {
      if (i > 0) condensed += ' ';
      condensed += sentence;
      if (condensed.slice(-1) !== '.') {
        condensed += '.'
      }
    }
    i++;
  }
  return condensed;
};

const IndividualFeature = ({ deselect, feature, hasMultipleFeatures }) => {
  const { Recid, Name, Role, City, State, Country, Description } = feature.properties;
  const roles = JSON.parse(Role);
  const recordLink = `http://research.frick.org/directoryweb/browserecord.php?-action=browse&-recid=${Recid}`;
  const condensedDescription = condenseText(Description);

  return (
    <div className='Popup-IndividualFeature'>
      <div className='Popup-IndividualFeature-actions'>
        {hasMultipleFeatures ? <button className='back-button' onClick={deselect}>&lt; back</button> : null}
        <div style={{ clear: 'both' }}></div>
      </div>
      <div className='Popup-IndividualFeature-content'>
        <div className='Popup-IndividualFeature-name'>
          <a href={recordLink} target='_blank'>{Name}</a>
        </div>
        <div className='Popup-IndividualFeature-role'>{roles.join(', ')}</div>
        <div className='Popup-IndividualFeature-location'>{City}{State ? `, ${State}` : null}{Country ? `, ${Country}` : null}</div>
        <div className='Popup-IndividualFeature-description'>{condensedDescription}</div>
        <div className='Popup-IndividualFeature-link'>
          <a href={recordLink} target="_blank">view record</a>
        </div>
      </div>
    </div>
  );
};

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFeature: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.features !== this.props.features) {
      this.setState({ selectedFeature: null });
    }
  }

  render() {
    const { close, coordinates, features, offset } = this.props;
    const { selectedFeature } = this.state;
    return (
      <MapboxPopup coordinates={coordinates} offset={offset}>
        <div className='Popup'>
          <div className='Popup-actions'>
            <button className='close-button' onClick={close}>&times;</button>
            <div style={{ clear: 'both' }}></div>
          </div>
          {(features.length > 1 && !selectedFeature) ? 
            <MultipleFeatures
              features={features}
              onSelect={(selectedFeature) => this.setState({ selectedFeature })}
            /> : (
              <IndividualFeature
                deselect={() => this.setState({ selectedFeature: null })}
                feature={selectedFeature || features[0]} 
                hasMultipleFeatures={features.length > 1}
              />
            )
          }
        </div>
      </MapboxPopup>
    );
  }
}
