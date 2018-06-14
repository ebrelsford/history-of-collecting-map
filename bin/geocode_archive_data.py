import csv
import sys

from geocode import geocode


def clean_field(value):
    value = value.strip()
    if value == '':
        return None
    return value

if __name__ == '__main__':
    input_file = csv.DictReader(sys.stdin)
    output_fieldnames = list(input_file.fieldnames) + ['Latitude', 'Longitude']
    output_file = csv.DictWriter(sys.stdout, output_fieldnames)
    output_file.writeheader()

    for row in input_file:
        try:
            city = clean_field(row['City'])
            state = clean_field(row['State'])
            country = clean_field(row['Country'])
            kwargs = {}
            if city:
                kwargs['city'] = city
            if state:
                kwargs['state'] = state
            if country:
                kwargs['country'] = country

            if (filter(None, [city, state, country])):
                result = geocode(**kwargs)
                if result:
                    row['Latitude'] = result['lat']
                    row['Longitude'] = result['lon']
                else:
                    q = ', '.join(filter(None, [city, state, country]))
                    print("Failed to geocode %s" % q, file=sys.stderr)
                output_file.writerow(row)
        except Exception as e:
            print(e, file=sys.stderr)
