const SocketServer = require('../utils/SocketServer');

exports.emit_message = (req, res, next) => {
    const message = req.body.value;
    SocketServer.sendAll(message);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

