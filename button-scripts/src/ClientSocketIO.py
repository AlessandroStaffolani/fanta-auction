from socketIO_client import SocketIO, LoggingNamespace # reference here: https://pypi.org/project/socketIO-client3/


class ClientSocketIO:

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.socket_client = None
        self.button_enabled = False

    def connect(self, user_token=None):
        if self.socket_client is None:
            if user_token is None:
                self.socket_client = SocketIO(self.host, self.port,
                                              namespace=LoggingNamespace)
            else:
                self.socket_client = SocketIO(self.host, self.port,
                                              params={'token': user_token},
                                              namespace=LoggingNamespace)
            self.socket_client.on('connect', self.on_connect)
            self.socket_client.on('disconnect', self.on_disconnect)
            self.socket_client.on('reconnect', self.on_reconnect)
            self.socket_client.on('message', self.on_message_response)
            self.socket_client.on('initAuction', self.on_init_autction_response)
            self.socket_client.on('close', self.close)

    def close(self):
        self.socket_client.disconnect()

    def on_connect(self):
        print('Connected to host = ' + self.host + ' port = ' + str(self.port))

    def on_disconnect(self):
        print('disconnect to host = ' + self.host + ' port = ' + str(self.port))

    def on_reconnect(self):
        print('reconnect to host = ' + self.host + ' port = ' + str(self.port))

    def add_new_event(self, event, callback):
        self.socket_client.on(event, callback)

    def on_message_response(self, *args):
        for item in args:
            print('message response', item)

    def on_init_autction_response(self, value):
        self.button_enabled = value
        print(self.button_enabled)

    def emit(self, message):
        if self.socket_client is not None:
            print('Sending message: ', message)
            self.socket_client.emit('message', message)

    def emit_close(self):
        if self.socket_client is not None:
            self.socket_client.emit('close', True)

    def wait(self):
        self.socket_client.wait()

    def get_button_enabled(self):
        return self.button_enabled
