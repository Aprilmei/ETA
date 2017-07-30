from geopy.distance import distance
import networkx as nx

from data_loader import ALL_STOPS_TREE, COORD_STOPS, GRAPH, LINES
from main import log


def k_nearest_stop_coords(lat, lon, k=1, TREE=ALL_STOPS_TREE):
    """Queries TREE for the K nearest neighbours for the specified lat and lon.

    @params : lat  - float OR str
              lon  - float OR str
              k    - int (OPTIONAL. Defaults to 1)
              TREE - scipy.spatial.cKDTree (OPTIONAL. Defaults to ALL_STOPS_TREE)

    @returns [ (float(lat), float(lon)) , ...]
    """

    results = []

    # discards euclidean distance
    _, indexes = TREE.query((lat, lon), k=k)

    for idx in indexes:
        coords = TREE.data[idx]
        coords = (float(coords[0]), float(coords[1]))
        results.append(coords)

    log.debug(results)
    return results


def stop_id_for_coords(coords, LOOKUP_DICT=COORD_STOPS):
    """Takes coords and returns the corresponding Stop Id.

    @params  : coords  - (str(lat), str(lon))
    @returns : str
    """
    return LOOKUP_DICT[coords]


def journey_transits(origin_stop_id, destination_stop_id,
                     max_changes=None, GRAPH=GRAPH):
    """Takes two stop IDs and finds the routes requiring fewest changes
    between them.

    @params : origin_stop_id      - str
              destination_stop_id - str
              max_changes    - int (OPTIONAL. Defaults to None (infinite))
              GRAPH          - networkx.Multigraph (OPTIONAL. Defaults to GRAPH)

    @returns : [str(stopId)] - list of stops on the journey, including origin and destination
    """

    changes = nx.shortest_path(GRAPH, origin_stop_id, destination_stop_id)

    if max_changes and len(changes) - 2 > max_changes:
        return []

    return changes


def lines_connecting_stops(origin_stop_id, destination_stop_id, GRAPH=GRAPH):
    """Takes a origin stop ID and destination stop ID, and returns a list of
    lines that go directly from origin to destination. Assumes no bus changes
    required (use necessary_stop_changes() first if needed)

    @ params : origin_stop_id - str 
               destination_stop_id - str
               GRAPH - nextworkx.multigraph (OPTIONAL. Defaults to GRAPH)

    @ returns : [ str( line_id ) ]
    """
    results = []

    edges = GRAPH[origin_stop_id][destination_stop_id]

    for edge in edges.values():
        results.append(edge['line'])

    return results


def find_routes(origin, destination, max_walk=500):
    """Takes two (lat, lon) coordinates, and finds the 
    easiest route between them.

    returns : a list of list of dictionaries. 
    eg:
        [
            [{'busses': ['83_O'], 'board': '315', 'deboard': '1016'}, ...], 
            [{'busses': ['65_I', '65b_I'], 'board': '1358', 'deboard': '1072'},...]
        ]
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
        origin_stop_id = stop_id_for_coords(origin)

        for destination in destination_stops:
            dest_stop_id = stop_id_for_coords(destination)

            # This will give us the stops in a journey required for fewest
            # number of changes
            journey_options.append(
                journey_transits(origin_stop_id, dest_stop_id))

    log.debug(journey_options)

    # only keep the options with fewest number of changes
    fewest_changes = float('inf')
    for opt in journey_options:
        if len(opt) < fewest_changes:
            fewest_changes = len(opt)

    journey_options = [opt for opt in journey_options
                       if len(opt) == fewest_changes]

    log.debug(journey_options)

    journey_options = [list(parse_route(opt)) for opt in journey_options]

    log.info(journey_options)
    return journey_options


def parse_route(changes, GRAPH=GRAPH):
    """takes the graph and a list of nodes, yields a tuple of a node, and the
    edges that link it to the next node in the list.
    @params : changes (list)
    @yields : {busses : list(of_bus_lines), board: str(stop_id), deboard: str(stop_id)}

    TODO: THE EDGE MIGHT BE CHOSEN ARBITRARILY. WHAT IF THERE ARE > 1 EDGES BEWTEEN
    THE NODES? CAN WE GET ALL EDGES?
    """

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
            'board': prev_stop,
            'deboard': next_stop
        }

        prev_stop = next_stop
