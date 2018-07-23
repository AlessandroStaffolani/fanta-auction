const net = require('net');
const config = require('../config/config');

const connectedClients = {};

function SocketServer() {
    start();

    this.send = function(object) {
        for(key in connectedClients)
            connectedClients[key].write(JSON.stringify(object))
    };

    function start() {
        const server = net.createServer(socket => {
            console.log("Server socket created");
            const clientId = `${socket.remoteAddress}`;
            connectedClients[clientId] = socket;

            console.log(`\n[${ clientId }] connected`);

            socket.on('data', message => {
                console.log("Message recived: " + message);
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

module.exports = SocketServer;