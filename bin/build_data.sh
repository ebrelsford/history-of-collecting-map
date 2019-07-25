#!/bin/bash

INPUT_FILE=$1
PREPARED_FILE='prepared.csv'
GEOCODED_FILE='geocoded.csv'
GEOJSON_FILE='results.json'

# Add headers
echo "DealerID,Recid,Name,Years,City,State,Country,Role,Gender,Description,Decades,Other Cities" > $PREPARED_FILE
cat $INPUT_FILE >> $PREPARED_FILE

# Clean and geocode
python3 bin/remove_non_utf8.py < $PREPARED_FILE | python3 bin/prepare_archive_data.py | python3 bin/geocode_archive_data.py > $GEOCODED_FILE
csv2geojson $GEOCODED_FILE > $GEOJSON_FILE

# Clean up
#rm $PREPARED_FILE

# TODO put geojson in the proper place
