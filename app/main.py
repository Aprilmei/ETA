import argparse
from flask import Flask
import config


def get_args():
    """User passes either 'dev' or 'production' at runtime to specify what config
    options are used."""
    parser = argparse.ArgumentParser()
    parser.add_argument('--environment',
                        type=str,
                        default='dev',
                        help='Specify whether the app is being run in a "dev" \
                        or "production" environment. Defaults to "dev"')
    return parser.parse_args()


def server_url():
    """js functions require the server URL for HTTP requests. Use this function
    to get the URL rather than hardcoding it, so it'll still work in production."""
    global conf
    return conf.server_url


app = Flask(__name__)
# Must import routes after app is defined because routes.py
# imports app from here
from routes import *


if __name__ == '__main__':
    args = get_args()

    if args.environment == 'dev':
        conf = config.DevelopmentConfig
    elif args.environment == 'production':
        conf = config.ProductionConfig
    else:
        raise SystemExit('Environment must be specified, and must \
                          be either "dev" or "production"')

    app.run(host=conf.listen_host,
            port=conf.listen_port,
            debug=conf.debug)
