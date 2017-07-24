'''
Created 21st June 2017
Author @Conan Martin
'''

from flask import Flask
"""

from flask_cors import CORS, cross_origin
# from geopy.distance import distance
import pickle
import sklearn
import scipy
import pandas as pd
"""

app = Flask(__name__)
from routes import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
