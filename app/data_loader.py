"""Reads needed files stored on disk into memory.

Ensures that data is loaded at import time (when the app is run) rather than
when it's requested by a function, limiting concurrency / blocking / latency
issues. 

THESE VALUES SHOULD ALL BE REGUARDED AS CONSTANTS. DO NOT WRITE TO THEM.
"""

import json
from os.path import dirname
import pickle


datadir = dirname(__file__) + '/data/'


with open(datadir + 'stops.pkl', 'rb') as f:
    STOP_COORDS = pickle.load(f)

with open(datadir + 'buslines.json') as f:
    LINES = json.load(f)

with open(datadir + 'graph.pkl', 'rb') as f:
    GRAPH = pickle.load(f)

with open(datadir + 'all_stops_tree.pkl', 'rb') as f:
    ALL_STOPS_TREE = pickle.load(f)

with open(datadir + 'coord_stops.pkl', 'rb') as f:
    COORD_STOPS = pickle.load(f)

with open(datadir + 'sk_linear_model2', 'rb') as f:
    loaded_model = pickle.load(f)

with open(datadir + 'linear_model_without_weather', 'rb') as f:
    loaded_model_without_weather = pickle.load(f)

with open(datadir + 'linear_model_with_weather', 'rb') as f:
    loaded_model_weather = pickle.load(f)