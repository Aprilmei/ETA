from typing import List, Tuple, Type, Generator, Dict, Any, Optional

from geopy.distance import distance
import networkx as nx
from scipy.spatial import cKDTree

from data_loader import ALL_STOPS_TREE, COORD_STOPS, GRAPH, LINES, STOP_COORDS
from main import log


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

    return [list(parse_route(t)) for t in transit_options]


def k_nearest_stop_coords(lat: float,
                          lon: float,
                          k: int=1,
                          tree: cKDTree=ALL_STOPS_TREE)\
        -> List[Tuple[float, float]]:
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


def parse_route(changes: List[str], graph: nx.MultiGraph=GRAPH)\
        -> Generator[Dict[str, Any], None, None]:
    """
    TODO: THE EDGE MIGHT BE CHOSEN ARBITRARILY. WHAT IF THERE ARE > 1 EDGES BEWTEEN
    THE NODES? CAN WE GET ALL EDGES?
    """

    changes = iter(changes)
    prev_stop = next(changes)

    for next_stop in changes:

        lines = [edge['line']
                 for edge in graph[prev_stop][next_stop].values()]

        yield {
            'busses': lines,
            'board': {
                'id': prev_stop,
                'lat': stop_coords(prev_stop)[0],
                'lng': stop_coords(prev_stop)[1]
            },
            'deboard': {
                'id': next_stop,
                'lat': stop_coords(next_stop)[0],
                'lng': stop_coords(next_stop)[1]
            }
        }
        prev_stop = next_stop
