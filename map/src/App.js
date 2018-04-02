import React, { Component } from 'react';
import fetch from 'unfetch';

import CollectingMap from './CollectingMap';
import Filters from './Filters';
import './App.css';
import './FilterToggle.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      filters: {
        decadeRange: [],
        gender: 'any',
        role: 'any',
        search: ''
      },
      filtersOpen: false
    };
  }

  componentDidMount() {
    fetch(`${process.env.PUBLIC_URL}/people.json`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const mapped = { ...{}, ...data };
        mapped.features = data.features.map(feature => {
          if (feature.properties.Decades && feature.properties.Decades.length > 0) {
            feature.properties.Decades = feature.properties.Decades.split(';').map(d => parseInt(d, 10));
          }
          feature.properties.Role = feature.properties.Role.split(';');
          return feature;
        });
        return mapped;
      })
      .then(data => this.setState({ data }));
  }

  updateFilters(updates) {
    this.setState({
      filters: { ...this.state.filters, ...updates }
    });
  }

  render() {
    return (
      <div className='App'>
        {!this.state.filtersOpen ? (
          <button className='FilterToggle' onClick={() => this.setState({ filtersOpen: true })}>
            <div className='FilterToggle-line' />
            <div className='FilterToggle-line' />
            <div className='FilterToggle-line' />
          </button>
        ) : null}
        <Filters visible={this.state.filtersOpen} data={this.state.data} filters={this.state.filters} onChange={this.updateFilters.bind(this)} onClose={() => this.setState({ filtersOpen: false })} />
        <CollectingMap data={this.state.data} filters={this.state.filters} />
      </div>
    );
  }
}

export default App;
