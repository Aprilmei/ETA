from typing import List, Tuple, Type, Generator, Dict, Any, Optional

from geopy.distance import distance
import networkx as nx
from scipy.spatial import cKDTree

from main import log

from data_loader import ALL_STOPS_TREE, COORD_STOPS, GRAPH, LINES, STOP_COORDS


class WrongJourneyDirectionError(Exception):
    pass


def find_routes(origin: Tuple[float, float],
                destination: Tuple[float, float],
                max_walk: int = 500) -> List[List[dict]]:

    origin_stops = [
        stop for stop in k_nearest_stop_coords(*origin, k=10)
        if distance(origin, stop).meters <= max_walk
    ]

    destination_stops = [
        stop for stop in k_nearest_stop_coords(*destination, k=10)
        if distance(destination, stop).meters <= max_walk
    ]

    transit_options = [
        journey_transits(stop_id(origin), stop_id(dest))
        for origin in origin_stops
        for dest in destination_stops
    ]

    # only keep the options with fewest number of changes
    fewest_changes = len(min(transit_options, key=len))

    transit_options = [t for t in transit_options
                       if len(t) == fewest_changes]

    routes = []
    for t in transit_options:
        try:
            routes.append(list(parse_route(t)))
        except WrongJourneyDirectionError:
            pass

    return routes


def get_stops_between(origin_id: str,
                      destination_id: str,
                      line_id: str,
                      bus_lines: Dict[str, List[str]] = LINES
                      ) -> List[Dict[str, Any]]:
    l = bus_lines[line_id]

    l = l[
        l.index(origin_id):
        l.index(destination_id) + 1
    ]
    log.debug(l)
    return [{
        'id': stop_id,
        'lat': stop_coords(stop_id)[0],
        'lng': stop_coords(stop_id)[1]
    } for stop_id in l]


def k_nearest_stop_coords(lat: float,
                          lon: float,
                          k: int=1,
                          tree: cKDTree=ALL_STOPS_TREE
                          )-> List[Tuple[float, float]]:
    """
    Queries tree for the k nearest neighbours for the specified lat and lon.
    Returns a list of (lat, lon) tuples.
    """

    results = []
    # discards euclidean distance
    _, indexes = tree.query((lat, lon), k=k)

    for idx in indexes:
        coords = tree.data[idx]
        coords = (float(coords[0]), float(coords[1]))
        results.append(coords)

    return results

def stop_id(coords: Tuple[float, float], lookup: dict=COORD_STOPS) -> str:
    """ Takes coords and returns the corresponding Stop Id. """
    return lookup[coords]


def stop_coords(stop_id: str, lookup: dict=STOP_COORDS) -> Tuple[float, float]:
    """ Takes a stop id and returns correspongding coordinates. """
    return lookup[stop_id]


def journey_transits(origin_stop_id: str,
                     destination_stop_id: str,
                     max_changes: Optional[int]=None,
                     graph: nx.MultiGraph=GRAPH) -> List[str]:
    """
    Takes two stop IDs and finds the routes requiring fewest changes between them.
    Returns a list of stops on the journey, including origin and destination
    """

    changes = nx.shortest_path(graph, origin_stop_id, destination_stop_id)

    if max_changes and len(changes) - 2 > max_changes:
        return []
    return changes


def strip_direction(line_id):
    return line_id.split('_')[0]


def parse_route(changes: List[str], graph: nx.MultiGraph=GRAPH
                )-> Generator[Dict[str, Dict[str, Any]], None, None]:

    changes = iter(changes)
    prev_stop = next(changes)

    for next_stop in changes:

        lines = [
            edge['line']
            for edge in graph[prev_stop][next_stop].values()
        ]

        lines_stops = [
            {
                'line': strip_direction(line),
                'stops': get_stops_between(prev_stop, next_stop, line)
            }
            for line in lines
            # If the stops aren't visited in the right order,
            # get_stops_between will return an empty list
            if len(get_stops_between(prev_stop, next_stop, line)) != 0
        ]

        if not lines_stops:
            raise WrongJourneyDirectionError

        yield lines_stops

        prev_stop = next_stop
