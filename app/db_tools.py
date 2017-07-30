from sqlalchemy import create_engine


def connect_to_database():
    with open('password.txt', 'r') as fh:
        password = fh.readline().strip().rstrip('\n')
    username = "eta"
    uri = "eta.cb0ofqejduea.eu-west-1.rds.amazonaws.com"
    port = "3306"
    db_name = "eta"
    engine = create_engine(
        "mysql+pymysql://{}:{}@{}:{}/{}".format(username, password, uri, port, db_name))
    return engine
