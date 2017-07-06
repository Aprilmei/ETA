'''
Created 21st June 2017
Author @Conan Martin
'''

from flask import Flask, render_template, jsonify
from sqlalchemy import create_engine


app = Flask(__name__, static_url_path='')


def connect_to_database():
	fh = open('password.txt', 'r')
	password = fh.readline().strip()
	username = "eta"
	uri = "eta.cb0ofqejduea.eu-west-1.rds.amazonaws.com"
	port = "3306"
	db_name = "eta"
	engine = create_engine("mysql+pymysql://{}:{}@{}:{}/{}".format(username, password, uri, port, db_name))
	return engine


@app.route("/")
def hello():
	return render_template("index.html")

@app.route("/routes")
def get_routes():
	engine = connect_to_database()
	conn = engine.connect()
	routes = []
	rows = conn.execute("SELECT * FROM routes;")
	for row in rows:
		routes.append(dict(row))

	return jsonify(routes=routes)


@app.route("/stops")
def get_stops():
	engine = connect_to_database()
	conn = engine.connect()
	stops = []
	rows = conn.execute("SELECT stop_address, stop_id FROM bus_stops ORDER BY stop_address;")
	for row in rows:
		stops.append(dict(row))

	return jsonify(stops=stops)


@app.route("/destination_stops/<int:stop_id>")
def get_destination_stops(stop_id):
	engine = connect_to_database()
	conn = engine.connect()
	stops = []
	rows = conn.execute("select * from eta.bus_stops where stop_id in (select distinct stop_id from eta.routes where journey_pattern in (select journey_pattern from eta.routes where stop_id = {}) and stop_id != {}) order by stop_address;".format(stop_id, stop_id))
	for row in rows:
		stops.append(dict(row))

	return jsonify(stops=stops)

@app.route("/possible_routes/<int:origin_id>/<int:destination_id>")
def get_possible_routes(origin_id, destination_id):
	engine = connect_to_database()
	conn = engine.connect()
	routes = []
	rows = conn.execute("SELECT journey_pattern FROM eta.routes Where stop_id = {} and journey_pattern in ( SELECT journey_pattern FROM eta.routes Where stop_id = {});".format(origin_id, destination_id))
	for row in rows:
		routes.append(dict(row))

	return jsonify(routes=routes)


if __name__ == '__main__':
	app.run()

