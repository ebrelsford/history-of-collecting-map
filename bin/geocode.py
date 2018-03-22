import requests
import sys
import time


ACCEPTED_TYPES = ('administrative', 'city', 'suburb', 'town')
RESULTS_CACHE = {}
NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?'


def nominatim_request(city=None, state=None, country=None):
    q = ', '.join(filter(None, [city, state, country]))
    try:
        return RESULTS_CACHE[q]
    except KeyError:
        pass

    # If cache not hit, go easy on nominatim server and wait a moment
    time.sleep(1.1)

    params = {
        'format': 'jsonv2',
        'q': q,
    }
    response = requests.get(NOMINATIM_URL, params=params)
    response.raise_for_status()
    result = list(filter(lambda r: r['type'] in ACCEPTED_TYPES, response.json()))[0]
    RESULTS_CACHE[q] = result
    return result


def make_nominatim_request(**kwargs):
    try:
        return nominatim_request(**kwargs)
    except Exception as e:
        return None


def geocode(city=None, state=None, country='USA'):
    result = make_nominatim_request(city=city, state=state, country=country)
    if not result:
        result = make_nominatim_request(city=city, state=state)
    return result
