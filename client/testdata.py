# This script can be used to provide testdata to the geobroker

import datetime
import time

import requests

base_url = 'http://localhost:8071/geobroker/api/v1/'


def build_point(latlng):
    if latlng:
        return {
            'latitude': latlng[0],
            'longitude': latlng[1],
        }
    else:
        return None


def build_inbetween(a, b, pos):
    if not a or not b:
        return None

    return {
        'latitude': (1 - pos) * a['latitude'] + pos * b['latitude'],
        'longitude': (1 - pos) * a['longitude'] + pos * b['longitude'],
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
    }


def build_unit(id, name, visible_units, last, target, available):
    return {
        'id': id,
        'name': name,
        'token': 't' + id,
        'units': visible_units,
        'lastPoint': build_point(last),
        'targetPoint': build_point(target),
        'isAvailableForDispatching': available,
    }


def build_incident(id, priority, blue, info, location, assigned_units):
    unit_names = {}
    for unit in assigned_units:
        unit_names[unit] = units[unit]['name']

    return {
        'id': id,
        'type': 'Task',
        'priority': priority,
        'blue': blue,
        'info': info,
        'location': build_point(location),
        'assignedUnits': unit_names,
    }


def send_unit(unit):
    response = requests.put(base_url + 'private/units/' + unit['id'], json=unit)
    print_response(response)


def send_incident(incident):
    response = requests.put(base_url + 'private/incidents/' + incident['id'], json=incident)
    print_response(response)


def send_position(id, position):
    if position:
        response = requests.post(base_url + 'public/positions/' + id + '?token=t' + id, json=position)
        print_response(response)


def print_response(response: requests.Response):
    if not response.ok:
        print(response.url + ': ' + str(response.status_code))


units = {
    'sew': build_unit('sew', 'SEW 010', [], [48.234352, 16.281295], [48.263146, 16.32437], True),
    'ktw': build_unit('ktw', 'KTW 050', [], [48.211968, 16.287243], [48.173259, 16.24129], True),
    'rtw': build_unit('rtw', 'RTW 300', [], [48.219593, 16.344661], [48.227194, 16.391841], True),
    'nef': build_unit('nef', 'NEF 352', [], [48.184258, 16.36925], [48.201774, 16.3196], False),
    'vok': build_unit('vok', 'VOK 315', [], [48.249663, 16.474178], [48.230374, 16.421247], False),
    'kdo': build_unit('kdo', 'Kdo 1', [], [48.172499, 16.429802], [48.203738, 16.399105], False),
    'trp1': build_unit('trp1', 'TRP 1', [], None, None, True),
    'trp2': build_unit('trp2', 'TRP 2', [], None, None, False),
    'el': build_unit('el', 'EL', ['sew', 'ktw', 'rtw', 'nef', 'vok', 'kdo', 'trp1', 'trp2'], [48.246384, 16.38639], [48.231167, 16.338737], True),
    'mls': build_unit('mls', 'MLS', ['sew', 'ktw', 'rtw', 'nef', 'vok', 'kdo', 'trp1', 'trp2', 'el'], None, None, False),
}

incidents = [
    build_incident('inc01', False, False, 'no priority/not blue/no unit', [48.225683, 16.316174], []),
    build_incident('inc02', False, False, 'no priority/not blue/1 unit', [48.227034, 16.406199], ['sew']),
    build_incident('inc03', False, False, 'no priority/not blue/2 units', [48.187612, 16.319149], ['ktw', 'rtw']),
    build_incident('inc04', False, True, 'no priority/blue/no unit', [48.193836, 16.405698], []),
    build_incident('inc05', False, True, 'no priority/blue/1 unit', [48.252029, 16.350139], ['vok']),
    build_incident('inc06', False, True, 'no priority/blue/2 units', [48.205731, 16.36539], ['nef', 'rtw']),
    build_incident('inc07', True, False, 'priority/not blue/no unit', [48.212623, 16.500053], []),
    build_incident('inc08', True, False, 'priority/not blue/1 unit', [48.167958, 16.385402], ['trp1']),
    build_incident('inc09', True, False, 'priority/not blue/2 units', [48.183796, 16.289092], ['trp1', 'trp2']),
    build_incident('inc10', True, True, 'priority/blue/no unit', [48.220506, 16.347852], []),
    build_incident('inc11', True, True, 'priority/blue/1 unit', [48.185784, 16.355131], ['el']),
    build_incident('inc12', True, True, 'priority/blue/2 units', [48.204189, 16.409585], ['sew', 'nef']),
]

for unit in units.values():
    send_unit(unit)

units['mls']['incidents'] = []
for incident in incidents:
    send_incident(incident)
    units['mls']['incidents'].append(incident['id'])

send_unit(units['mls'])

pos = 0
while True:
    for unit in units.values():
        send_position(unit['id'], build_inbetween(unit['lastPoint'], unit['targetPoint'], pos))
    pos += 0.1
    if pos > 1:
        pos = 0
    time.sleep(4)

# send_position('sew', [48.234352, 16.281295])
# send_position('ktw', [48.211968, 16.287243])
# send_position('rtw', [48.219593, 16.344661])
# send_position('nef', [48.184258, 16.36925])
# send_position('vok', [48.249663, 16.474178])
# send_position('kdo', [48.172499, 16.429802])
# send_position('el', [48.246384, 16.38639])
