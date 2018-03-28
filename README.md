# History of Art Collecting Map

This repository holds scripts and front-end code for mapping the history of art collecting as researched by the [Center for the History of Collecting](https://www.frick.org/research/center) at [The Frick Collection](https://www.frick.org/).

## Scripts

The scripts in `bin` take a CSV from the Center's database, format the CSV, and geocode the cities in the CSV, creating a GeoJSON file that can be served on the map.

Requirements:
 * an internet connection
 * bash
 * Python 3
 * [requests](http://docs.python-requests.org/en/master/)
 * [csv2geojson](https://github.com/mapbox/csv2geojson)

Run the script on an input CSV:

```
./bin/build_data.sh $INPUT_CSV
```

## Map

The map is a front-end JavaScript application in `map`. Build it like so:
 1. `cd map`
 2. `npm install`
 3. `mv src/config.example.js src/config.js` and edit the variables
 4. `npm run build`

The application will then be available in `map/build`.
