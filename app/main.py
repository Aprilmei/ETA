from flask import Flask

if __name__ == '__main__':
    app = Flask(__name__)
    from routes import *
    app.run(host='0.0.0.0', port=5000, debug=True)
