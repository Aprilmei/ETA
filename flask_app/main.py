'''
Created 21st June 2017
Author @Conan Martin
'''

from flask import Flask, render_template

app = Flask(__name__, static_url_path='')


@app.route("/")
def hello():
	return render_template("index.html")


if __name__ == '__main__':
	app.run()
