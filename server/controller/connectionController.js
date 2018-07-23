const SocketServer = require('../utils/SocketServer');
let server = new SocketServer();

exports.init_server_socket = (req, res, next) => {
    console.log("init client server")
};