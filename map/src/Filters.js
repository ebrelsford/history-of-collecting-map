import classNames from 'classnames';
import uniq from 'lodash.uniq';
import React, { Component } from 'react';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import './Filters.css';

export default class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      possibleDecadeRange: [],
      selectedDecadeRange: [],
      genders: [],
      roles: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const decades = this.getUnique(nextProps.data, 'Decades');
      const possibleDecadeRange = [decades[0], decades.slice(-1)[0] + 10];

      this.setState({
        possibleDecadeRange,
        roles: this.getUnique(nextProps.data, 'Role')
      });

      this.props.onChange({ decadeRange: possibleDecadeRange });
    }
  }

  getUnique(data, key) {
    let values = [];
    data.features.forEach(feature => {
      values = values.concat(feature.properties[key]);
    });

    values = uniq(values);
    values.sort();
    return values.filter(v => v !== '');
  }

  render() {
    const { filters, onClose, visible } = this.props;
    const { possibleDecadeRange, roles } = this.state;

    return (
      <div className={classNames('Filters', { visible })}>
        <button className='Filters-close' onClick={onClose} aria-label='Close filters'>&times;</button>
        <h2 className='Filter-header'>Filter records</h2>
        <div className='Filter'>
          <label className='Filter-label' htmlFor='keyword'>Keyword (name, description, location):</label>
          <div>
            <input type='text' onChange={e => this.props.onChange({ search: e.target.value })} value={filters.search} id='keyword' />
          </div>
        </div>

        <div className='Filter'>
          <label className='Filter-label' htmlFor='role'>Role:</label>
          <div>
            <select onChange={e => this.props.onChange({ role: e.target.value })} value={filters.role} id='role'>
              <option>any</option>
              {roles.map(role => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className='Filter'>
          <label className='Filter-label' htmlFor='years-active'>Years active:</label>
          <div className='year-slider'>
            <span className='year-slider-indicator year-slider-indicator-left'>{filters.decadeRange[0]}</span>
            <Range
              min={possibleDecadeRange[0]}
              max={possibleDecadeRange[1]}
              onChange={value => this.props.onChange({ decadeRange: value })}
              step={10}
              value={filters.decadeRange}
              id='years-active'
            />
            <span className='year-slider-indicator year-slider-indicator-right'>{filters.decadeRange[1]}</span>
          </div>
        </div>

        <div className='Filter'>
          <label className='Filter-label' htmlFor='gender'>Gender:</label>
          <div>
            <select onChange={e => this.props.onChange({ gender: e.target.value })} value={filters.gender} id='gender'>
              <option>any</option>
              <option>M</option>
              <option>F</option>
              <option value='n/a'>unknown</option>
            </select>
          </div>
        </div>

        <a className='Filter-view-fullscreen' href='.' target='_blank'>view fullscreen</a>
      </div>
    );
  }
}
