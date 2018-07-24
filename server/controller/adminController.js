const SocketServer = require('../utils/SocketServer');
let counter = 5;
let repeat = undefined;

exports.emit_message = (req, res, next) => {
    const message = req.body.value;
    SocketServer.sendAll('message', message);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.timer_reset = (req, res, next) => {
    counter = 5;
    clearInterval(repeat);
    SocketServer.sendAll('timer', counter);
    SocketServer.sendAll('reset', true);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.timer_update = (req, res, next) => {
    repeat = setInterval(() => {
        if (counter === 0) {
            SocketServer.sendAll('timer', 0);
            SocketServer.sendAll('reset', true);
            clearInterval(repeat);
        } else {
            SocketServer.sendAll('timer', counter);
            counter--;
        }
    }, 1000);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.current_player = (req, res, next) => {
    const player = req.body.player;
    SocketServer.sendAll('message', player);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
}