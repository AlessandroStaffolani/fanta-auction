const jwt = require('jsonwebtoken');
const jsonWebToken = require('../crypto/jsonWebToken');

const connectedClients = {};
let adminClient = undefined;
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
            let newUserConnectedMessage = '';
            if (user.role === 'admin') {
                newUserConnectedMessage = "Admin connected";
                adminClient = socket;
                socket.on('playerTyping', (message) => {
                    sendAll('playerTyping', message.value);
                    sendAdmin('playerTyping', message.value);
                });
            } else {
                socket.on('playerTyping', (message) => {
                    sendAll('playerTyping', message.value);
                    sendAdmin('playerTyping', message.value);
                });
                connectedClients[user.username] = socket;
                newUserConnectedMessage = "User connected: " + user.username;
                if (adminClient) {
                    sendConnectedClients('playerConnected');
                }
            }
            console.log(newUserConnectedMessage);
            //sendAll('message', newUserConnectedMessage);
        });

        io.on('close', () => {
            console.log('user disconnected');
            if (adminClient) {
                sendConnectedClients('playerConnected');
            }
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

const sendAdmin = (type, value) => {
    adminClient.emit(type, {
        value: value
    })
};

const sendConnectedClients = (toType) => {
    let clientsUsername = [];
    for (let username in connectedClients) {
        clientsUsername.push(username);
    }
    sendAdmin(toType, clientsUsername);
};

module.exports = {
    init: init,
    sendAll: sendAll,
    sendAdmin: sendAdmin,
};