class DevelopmentConfig:
    listen_port = 5000
    listen_host = '127.0.0.1'
    server_url = '127.0.0.1'
    debug = True


class ProductionConfig:
    listen_port = 80
    listen_host = '0.0.0.0'
    server_url = 'csi6220-4-vm1.ucd.ie'
    debug = False
