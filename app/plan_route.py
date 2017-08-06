from typing import List, Tuple, Type, Generator, Dict, Any, Optional

from geopy.distance import distance
import networkx as nx
from scipy.spatial import cKDTree

from data_loader import ALL_STOPS_TREE, COORD_STOPS, GRAPH, LINES, STOP_COORDS
from main import log


def k_nearest_stop_coords(lat: float, 
                          lon: float, 
                          k: int = 1, 
                          tree: cKDTree = ALL_STOPS_TREE)\
                          -> List[Tuple[float, float]]:
    """Queries TREE for the K nearest neighbours for the specified lat and lon.
    @returns : [ (float(lat), float(lon)) , ...]
    """

    results = []
    # discards euclidean distance
    _, indexes = tree.query((lat, lon), k=k)

    for idx in indexes:
        coords = tree.data[idx]
        coords = (float(coords[0]), float(coords[1]))
        results.append(coords)

    return results


def stop_id_for_coords(coords: Tuple[float, float],
                       lookup_dict: dict = COORD_STOPS) -> str:
    """Takes coords and returns the corresponding Stop Id."""
    return lookup_dict[coords]


def journey_transits(origin_stop_id: str,
                     destination_stop_id: str,
                     max_changes: Optional[int] = None,
                     graph: nx.MultiGraph = GRAPH) -> List[str]:
    """Takes two stop IDs and finds the routes requiring fewest changes
    between them.

    Returns a list of stops on the journey, including origin and destination
    """

    changes = nx.shortest_path(graph, origin_stop_id, destination_stop_id)

    if max_changes and len(changes) - 2 > max_changes:
        return []

    return changes


def lines_connecting_stops(origin_stop_id: str,
                           destination_stop_id: str,
                           graph: nx.MultiGraph = GRAPH) -> List[str]:
    """Takes a origin stop ID and destination stop ID, and returns a list of
    lines that go directly from origin to destination. 

    Assumes no bus changes required (use necessary_stop_changes() first if needed)
    """
    results = []

    edges = graph[origin_stop_id][destination_stop_id]

    for edge in edges.values():
        results.append(edge['line'])

    return results


def find_routes(origin: Tuple[float, float],
                destination: Tuple[float, float],
                max_walk: int = 500) -> List[List[dict]]:

    """Takes two (lat, lon) coordinates, and finds the easiest route between them.
    TODO: This is damn ugly, needs refactoring
    """

    origin_stops = k_nearest_stop_coords(*origin, k=10)
    destination_stops = k_nearest_stop_coords(*destination, k=10)

    # get rid of stops not within walking distance
    origin_stops = [os for os in origin_stops
                    if distance(origin, os).meters <= max_walk]

    destination_stops = [ds for ds in destination_stops
                         if distance(destination, ds).meters <= max_walk]

    journey_options = []
    for origin in origin_stops:
        for destination in destination_stops:

            # This will give us the stops in a journey required for fewest
            # number of changes
            journey_options.append(
                journey_transits(stop_id_for_coords(origin),
                                 stop_id_for_coords(destination)))

    # only keep the options with fewest number of changes
    fewest_changes = float('inf')
    for opt in journey_options:
        if len(opt) < fewest_changes:
            fewest_changes = len(opt)

    journey_options = [opt for opt in journey_options
                       if len(opt) == fewest_changes]

    journey_options = [list(parse_route(opt)) for opt in journey_options]

    log.debug(journey_options[0])
    return journey_options


def parse_route(changes: List[str], graph: nx.MultiGraph = GRAPH)\
        -> Generator[Dict[str, Any], None, None]:
    """
    @yields : {busses : list(of_bus_lines), board: str(stop_id), deboard: str(stop_id)}

    TODO: THE EDGE MIGHT BE CHOSEN ARBITRARILY. WHAT IF THERE ARE > 1 EDGES BEWTEEN
    THE NODES? CAN WE GET ALL EDGES?
    """
    global STOP_COORDS

    changes = iter(changes)
    prev_stop = next(changes)

    for next_stop in changes:

        # Sometimes there's more than only line (edge) for any given 2 nodes
        lines = []
        edges = GRAPH[prev_stop][next_stop]
        for edge in edges.values():
            lines.append(edge['line'])
        yield {
            'busses': lines,
            'board': {
                'id': prev_stop,
                'lat': STOP_COORDS[prev_stop][0],
                'lng': STOP_COORDS[prev_stop][1]
            },
            'deboard': {
                'id': next_stop,
                'lat': STOP_COORDS[next_stop][0],
                'lng': STOP_COORDS[next_stop][1]
            }
        }

        prev_stop = next_stop
