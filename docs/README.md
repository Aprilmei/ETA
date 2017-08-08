# Application overview and explaination of files, classes and functions

### Building and running the application

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

### main.py
If `main.py` is being run directly, the following argument can be passed:

```
--environment 'development' OR 'production'
```

This defaults to `development`, which runs the application exposed on address `127.0.0.1`, port: `5000`

`Production` exposes the application using the address `0.0.0.0` allowing it to be accessed by remote clients, and exposes port `80`.
**This usually requires root privilages**

