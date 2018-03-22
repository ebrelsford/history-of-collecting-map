import uniq from 'lodash.uniq';
import React, { Component } from 'react';
import './Filters.css';

export default class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      decades: [],
      genders: [],
      roles: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        decades: this.getUnique(nextProps.data, 'Decades'),
        roles: this.getUnique(nextProps.data, 'Role'),
      });
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
    const { filters } = this.props;
    const { decades, roles } = this.state;

    return (
      <div className='Filters'>
        <h2 className='Filter-header'>Filter records</h2>
        <div className='Filter'>
          <div className='Filter-label'>Name:</div>
          <div>
            <input type='text' onChange={e => this.props.onChange({ name: e.target.value })} value={filters.name} />
          </div>
        </div>

        <div className='Filter'>
          <div className='Filter-label'>Role:</div>
          <div>
            <select onChange={e => this.props.onChange({ role: e.target.value })} value={filters.role}>
              <option>any</option>
              {roles.map(role => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className='Filter'>
          <div className='Filter-label'>Decades:</div>
          <div>
            <select onChange={e => this.props.onChange({ decades: e.target.value })} value={filters.decades}>
              <option>any</option>
              {decades.map(decade => (
                <option key={decade}>{decade}</option>
              ))}
            </select>
          </div>
        </div>

        <div className='Filter'>
          <div className='Filter-label'>Gender:</div>
          <div>
            <select onChange={e => this.props.onChange({ gender: e.target.value })} value={filters.gender}>
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
