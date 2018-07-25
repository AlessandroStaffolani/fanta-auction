const jwt = require('jsonwebtoken');
const jsonWebToken = require('../crypto/jsonWebToken');

const connectedClients = {};
let io = undefined;

const init = (server) => {
    if (!io) {
        io = require('socket.io')(server);

        // middleware
        io.use((socket, next) => {
            const token = socket.handshake.query.token;

            jwt.verify(token, process.env.SECRET, function (err, user) {
                if (err) {
                    return next(new Error('Authentication error'));
                } else {
                    return next();
                }
            });
        });

        io.on('connection', (socket) => {
            const token = socket.handshake.query.token;
            const user = jsonWebToken.getUserData(token);
            connectedClients[user._id] = socket;
            let newUserConnectedMessage = "User connected: " + user.username;
            console.log(newUserConnectedMessage);
            //sendAll('message', newUserConnectedMessage);
        });

        io.on('close', () => {
            console.log('user disconnected');
        })
    }
};

const sendAll = (type, value) => {
    Object.keys(connectedClients).forEach(key => {
        let socket = connectedClients[key];
        socket.emit(type, {
            value: value
        });
    })
};

module.exports = {
    init: init,
    sendAll: sendAll
};

/*function SocketServer(server) {
    if (!io) {
        start(server);
    }

    function start(server) {
        io = require('socket.io')(server);

        // middleware
        io.use((socket, next) => {
            const token = socket.handshake.query.token;

            jwt.verify(token, process.env.SECRET, function (err, user) {
                if (err) {
                    return next(new Error('Authentication error'));
                } else {
                    return next();
                }
            });
        });

        io.on('connection', function(socket){
            const token = socket.handshake.query.token;
            const user = jsonWebToken.getUserData(token);
            connectedClients[user._id] = socket;
            let newUserConnectedMessage = "User connected: " + user.username;
            console.log(newUserConnectedMessage);
            send({
                value: newUserConnectedMessage
            });
        });
    }
}

function send(object) {
    Object.keys(connectedClients).forEach(key => {
        let socket = connectedClients[key];
        socket.emit('message', object);
    })
}*/







/*
const net = require('net');
const config = require('../config/config');

const connectedClients = {};

function SocketServer() {
    start();

    this.send = (object) => {
        for(key in connectedClients)
            connectedClients[key].write(JSON.stringify(object))
    };

    function start() {
        const server = net.createServer(socket => {
            console.log("Server socket created");
            console.log(socket);
            console.log("Address = \t" + socket.remoteAddress);
            const clientId = `${socket.remoteAddress}`;
            connectedClients[clientId] = socket;

            console.log(`\n[${ clientId }] connected`);

            socket.on('data', message => {
                console.log("Message recived: " + message);
                console.log(String(message));
            });

            socket.on('end', () => {
                console.log(`[${ clientId }] connection terminated`);
                delete connectedClients[clientId]
            });

            socket.on('error', (err) => {
                console.log(`[${ clientId }] connection error`);
                delete connectedClients[clientId];
                console.log(err);
            });

        });

        server.listen(config.socketPort);

        server.on('error', (err) => {
            throw err;
        });

        console.log(`Socket server listening on port ${config.socketPort}`);
    }
}

module.exports = new SocketServer();*/
