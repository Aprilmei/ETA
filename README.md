# Application overview and explaination of files, classes and functions

### Building and running the application

*NOTE: a file `database.password` is expected to exist in the `app/` directory containing the password for the Amazon RDS server.*

#### In production
The application can be deployed using Docker.
The simplest approach is:

```
$ docker build -t eta .
$ docker run -p 80:80 eta
```

#### In development
Docker can and should be used in development as well as above to ensure the app works in the production environment. 

However, to utilise faster reloading of the development server, and ease debugging, the app can be run using Flask's DEBUG flag, on 127.0.0.1:5000

```
$ cd app
$ python3 main.py
```

---

## Files


### config.py

Specifies two possible set of configuration options; one for when running in a development environment and one for when running in production. See above for how to specify which is used.

### data_loader.py

Functions for reading various data structures and models from the `data` directory, so that files are only read once at time of import.

### db_tools.py

Provides a function to facilitate connections to the database

### main.py
If `main.py` is being run directly, the following argument can be passed:

```
--environment 'development' OR 'production'
```

This defaults to `development`, which runs the application exposed on address `127.0.0.1`, port `5000`, and sets the logging level to `DEBUG`.

`production` exposes the application using the address `0.0.0.0` allowing it to be accessed by remote clients, and exposes port `80`.
**This usually requires root privilages**


### plan_route.py
Contains functions that impliment the route finding solution. Utilsed by functions in routes.py


### routes.py
Defines the endpoints served by Flask.



