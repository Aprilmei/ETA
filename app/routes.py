import pickle

from flask import render_template, jsonify
from flask_cors import cross_origin
import pandas as pd

from main import app
from db_tools import connect_to_database
from os.path import dirname


@app.route("/")
def index():
	return render_template("index.html")

@app.route("/rti")
def rti():
	return render_template("rti.html")


@app.route("/stops/<int:year>")
@cross_origin()
def get_stops(year):
	engine = connect_to_database()
	conn = engine.connect()
	stops = []
	rows = conn.execute(
		"SELECT stop_address, stop_id FROM bus_stops WHERE year = {} ORDER BY stop_address;".format(year))
	for row in rows:
		stops.append(dict(row))
	return jsonify(stops=stops)



@app.route("/destination_stops/<int:stop_id>")
@cross_origin()
def get_destination_stops(stop_id):
	engine = connect_to_database()
	conn = engine.connect()
	stops = []
	rows = conn.execute("select * from eta.bus_stops where stop_id in (select \
						distinct stop_id from eta.routes where journey_pattern \
						in (select journey_pattern from eta.routes where stop_id \
						= {}) and stop_id != {}) order by stop_address;".format(stop_id, stop_id))
	for row in rows:
		stops.append(dict(row))
	return jsonify(stops=stops)


@app.route("/possible_routes/<int:origin_id>/<int:destination_id>")
@cross_origin()
def get_possible_routes(origin_id, destination_id):
	engine = connect_to_database()
	conn = engine.connect()
	routes = []
	rows = conn.execute("SELECT journey_pattern FROM eta.routes Where stop_id \
                        = {} and journey_pattern in ( SELECT journey_pattern \
                        FROM eta.routes Where stop_id = {});"
                        .format(origin_id, destination_id))
	for row in rows:
		routes.append(dict(row))
	return jsonify(routes=routes)


@app.route("/predict_time/<int:origin_id>/<int:destination_id>/<int:weekday>/<int:hour>/<jpid>")
@cross_origin()
def predict_time(origin_id, destination_id, weekday, hour, jpid):
#     stop_dist = {"44": 3432, "45": 3809, "46": 4603, "47": 4501, "48": 4665, "49": 4986, "50": 5162, "51": 5228, "52": 8648,
#                  "119": 3096, "213": 2314, "214": 2694, "226": 3, "227": 849, "228": 271, "229": 474, "230": 1050, "231": 1318,
#                  "265": 6338, "271": 6903, "340": 7330, "350": 7772, "351": 8277, "352": 8525, "353": 8772, "354": 8872,
#                  "355": 9075, "356": 9494, "357": 9907, "372": 10308, "373": 10635, "374": 10717, "375": 10949, "376": 11463,
#                  "377": 11775, "378": 11990, "380": 12957, "390": 9964, "1641": 1701, "1642": 2079, "2804": 11190, "4432": 2901}

	engine = connect_to_database()
	conn = engine.connect()
	o_distance = {}
	d_distance = {}

	origin_distance_list = conn.execute("SELECT position_on_route FROM routes WHERE stop_id = {} AND journey_pattern = {};".format(origin_id, "'" + jpid + "'"))
	destination_distance_list = conn.execute("SELECT position_on_route FROM routes WHERE stop_id = {} AND journey_pattern = {};".format(destination_id, "'" + jpid + "'"))

	for o in origin_distance_list:
		o_distance.update(dict(o))



	for d in destination_distance_list:
		d_distance.update(dict(d))

	origin_distance = o_distance['position_on_route']
	destination_distance = d_distance['position_on_route']

	print("O distance", origin_distance)
	print("D distance", destination_distance)
	# for row in rows:
	# 	coordinates.append(dict(row))

	# datadir = dirname(__file__) + '/data/'
	#
	# with open(datadir + 'sk_linear_model2') as f:
	# 	loaded_model = pickle.load(f)

	with open('data/sk_linear_model2', 'rb') as f:
		loaded_model = pickle.load(f)

	def get_time(distance, weekday, hour):
		params = [{
            'Distance_Terminal': distance,
			'midweek': weekday,
			'HourOfDay': hour,
        }]

		df = pd.DataFrame(params)

		estimated_time = loaded_model.predict(df)
		print(estimated_time)
		return estimated_time[0]

	origin_time = get_time(origin_distance, weekday, hour)
	dest_time = get_time(destination_distance, weekday, hour)

	# print("Time to start:", origin_time)
	# print("Time to destination:", dest_time)
	time = []
	time_dif = dest_time - origin_time
	time.append(time_dif)
	# print("Time between stops is: ", time)

	return jsonify(time=time)
