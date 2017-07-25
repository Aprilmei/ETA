import pickle

from flask import render_template, jsonify
from flask_cors import cross_origin

from main import app
from db_tools import connect_to_database


@app.route("/")
def index():
    print('connection received from X')
    return render_template("index.html")


@app.route("/stops")
@cross_origin()
def get_stops():
    engine = connect_to_database()
    conn = engine.connect()
    stops = []
    rows = conn.execute(
        "SELECT stop_address, stop_id FROM bus_stops ORDER BY stop_address;")
    for row in rows:
        stops.append(dict(row))

    return jsonify(stops=stops)


@app.route("/destination_stops/<int:stop_id>")
@cross_origin()
def get_destination_stops(stop_id):
    engine = connect_to_database()
    conn = engine.connect()
    stops = []
    rows = conn.execute("select * from eta.bus_stops where stop_id in (select distinct stop_id from eta.routes where journey_pattern in (select journey_pattern from eta.routes where stop_id = {}) and stop_id != {}) order by stop_address;".format(stop_id, stop_id))
    for row in rows:
        stops.append(dict(row))

    return jsonify(stops=stops)


@app.route("/possible_routes/<int:origin_id>/<int:destination_id>")
@cross_origin()
def get_possible_routes(origin_id, destination_id):
    engine = connect_to_database()
    conn = engine.connect()
    routes = []
    rows = conn.execute("SELECT journey_pattern FROM eta.routes Where stop_id = {} and journey_pattern in ( SELECT journey_pattern FROM eta.routes Where stop_id = {});".format(
        origin_id, destination_id))
    for row in rows:
        routes.append(dict(row))

    return jsonify(routes=routes)


@app.route("/predict_time/<int:origin_id>/<int:destination_id>")
@cross_origin()
def predict_time(origin_id, destination_id):
    stop_dist = {"44": 3432, "45": 3809, "46": 4603, "47": 4501, "48": 4665, "49": 4986, "50": 5162, "51": 5228, "52": 8648,
                 "119": 3096, "213": 2314, "214": 2694, "226": 3, "227": 849, "228": 271, "229": 474, "230": 1050, "231": 1318,
                 "265": 6338, "271": 6903, "340": 7330, "350": 7772, "351": 8277, "352": 8525, "353": 8772, "354": 8872,
                 "355": 9075, "356": 9494, "357": 9907, "372": 10308, "373": 10635, "374": 10717, "375": 10949, "376": 11463,
                 "377": 11775, "378": 11990, "380": 12957, "390": 9964, "1641": 1701, "1642": 2079, "2804": 11190, "4432": 2901}

    # engine = connect_to_database()
    # conn = engine.connect()
    # coordinates = []
    # rows = conn.execute("SELECT latitude, longitude FROM bus_stops WHERE stop_id = {} OR stop_id = {};".format(origin_id, destination_id))
    # for row in rows:
    # 	coordinates.append(dict(row))

    with open('data/sk_linear_model2', 'rb') as f:
        loaded_model = pickle.load(f)

    def get_time(distance):
        params = [{
            'Distance_Terminal': distance,
        }]

        df = pd.DataFrame(params)

        estimated_time = loaded_model.predict(df)
        return estimated_time[0]
    origin_time = get_time(stop_dist[str(origin_id)])
    dest_time = get_time(stop_dist[str(destination_id)])

    # print("Time to start:", origin_time)
    # print("Time to destination:", dest_time)
    time = []
    time_dif = dest_time - origin_time
    time.append(time_dif)
    # print("Time between stops is: ", time)

    return jsonify(time=time)
