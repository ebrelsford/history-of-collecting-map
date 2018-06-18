from functools import cmp_to_key
import requests
import sys
import time

from states import abbreviation_to_name


ACCEPTED_TYPES = (
    'administrative',
    'city',
    'hamlet',
    'locality',
    'suburb',
    'town',
    'village',
)
RESULTS_CACHE = {}
NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?'


def send_nominatim_request(params):
    """Send Nominatim request."""
    time.sleep(1.1)
    response = requests.get(NOMINATIM_URL, params=params)
    response.raise_for_status()
    return response.json()


def nominatim_request_combined(city=None, state=None, country=None):
    """
    Make Nominatim request with city, state, and country as one combined
    parameter.
    """
    q = ', '.join(filter(None, [city, state, country]))
    params = {
        'format': 'jsonv2',
        'q': q,
    }
    return send_nominatim_request(params)


def nominatim_request_separate(city=None, state=None, country=None):
    """
    Make Nominatim request with city, state, and country as separate
    parameters.
    """
    params = {
        'format': 'jsonv2',
        'city': city,
    }
    if state:
        params['state'] = state
    if country:
        params['country'] = country
    return send_nominatim_request(params)


def compare_responses(r1, r2):
    """Compare two Nominatim responses."""
    place_rank_1 = int(r1['place_rank'])
    place_rank_2 = int(r2['place_rank'])
    if place_rank_1 != place_rank_2:
        return place_rank_1 - place_rank_2

    importance_1 = r1['importance']
    importance_2 = r2['importance']
    return importance_2 - importance_1


def get_nominatim_result(city=None, state=None, country=None):
    """
    Get a nominatim result.

    Search in cache first, then make requests as necessary.
    """
    q = ', '.join(filter(None, [city, state, country]))
    try:
        return RESULTS_CACHE[q]
    except KeyError:
        pass

    kwargs = dict(city=city, state=state, country=country)
    responses = nominatim_request_separate(**kwargs)
    responses = list(filter(lambda r: r['type'] in ACCEPTED_TYPES, responses))
    responses = sorted(responses, key=cmp_to_key(compare_responses))
    result = responses[0]
    RESULTS_CACHE[q] = result
    return result


def nominatim_geocode(**kwargs):
    try:
        return get_nominatim_result(**kwargs)
    except Exception as e:
        return None


def geocode(city=None, state=None, country='USA'):
    try:
        state = abbreviation_to_name[state]
    except KeyError:
        pass

    result = nominatim_geocode(city=city, state=state, country=country)
    if not result:
        result = nominatim_geocode(city=city, state=state)
    return result
