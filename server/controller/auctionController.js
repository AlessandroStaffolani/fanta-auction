const SocketServer = require('../utils/SocketServer');
const Player = require('../model/player');
const User = require('../model/user');
let counter = 5;
let repeat = undefined;

exports.emit_message = (req, res, next) => {
    const message = req.body.value;
    SocketServer.sendAll('message', message);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.init_auction_player = (req, res, next) => {
    SocketServer.sendAll('initAuction', true);
    SocketServer.sendAdmin('initAuction', 'Auction initialized');
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.timer_start = (req, res, next) => {
    counter = 5;
    SocketServer.sendAll('timer', counter);
    SocketServer.sendAdmin('timer', counter);
    repeat = setInterval(() => {
        if (counter === 0) {
            SocketServer.sendAll('timer', 0);
            SocketServer.sendAdmin('timer', 0);
            //SocketServer.sendAll('reset', true);
            clearInterval(repeat);
        } else {
            SocketServer.sendAll('timer', counter);
            SocketServer.sendAdmin('timer', counter);
            counter--;
        }
    }, 1000);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.timer_reset = (req, res, next) => {
    counter = 5;
    clearInterval(repeat);
    SocketServer.sendAll('resetOffer', true);
    SocketServer.sendAdmin('resetOffer', 'Auction enabled');
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.current_player = (req, res, next) => {
    const player = req.body.player;
    SocketServer.sendAll('currentPlayer', player);
    SocketServer.sendAdmin('currentPlayer', player);
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json({send: true});
};

exports.init_player_offer = (req, res, next) => {
    const user = req.user;
    if (user) {
        let message = {
            value: true,
            user: user
        };
        clearInterval(repeat);
        SocketServer.sendAll('playerOffer', message);
        SocketServer.sendAdmin('playerOffer', message);
        res.header('Content-Type', 'application/json');
        res.status(200);
        res.json({send: true});
    } else {
        return res.status(401).json({
            auth: false,
            command: 'You are not allowed to access to this area'
        });
    }
};

exports.reserve_player = (req, res, next) => {
    const user = req.user;
    if (user) {
        const player_id = req.params.player_id;
        const offer = req.body.offer;
        const username = req.body.user;
        User.findOne({username: username})
            .then(user => {
                if (player_id) {
                    let playerPromise = Player.findById(player_id)
                        .then(player => {
                            player.currentOwner = user._id;
                            player.currentOffer = offer;
                            return player.save();
                        });
                    playerPromise
                        .then(player => {
                            Player.findById(player._id).populate('currentOwner')
                                .then(player => {
                                    counter = 5;
                                    SocketServer.sendAll('currentPlayer', player);
                                    SocketServer.sendAdmin('currentPlayer', player);
                                    SocketServer.sendAll('timer', counter);
                                    SocketServer.sendAdmin('timer', counter);
                                    repeat = setInterval(() => {
                                        if (counter === 0) {
                                            SocketServer.sendAll('timer', 0);
                                            SocketServer.sendAdmin('timer', 0);
                                            //SocketServer.sendAll('reset', true);
                                            clearInterval(repeat);
                                            player_assign(player);
                                        } else {
                                            SocketServer.sendAll('timer', counter);
                                            SocketServer.sendAdmin('timer', counter);
                                            counter--;
                                        }
                                    }, 1000);
                                    //SocketServer.sendAll('reset', true);
                                    res.header('Content-Type', 'application/json');
                                    res.status(200);
                                    res.json({send: true});
                                })
                        });
                }
            })
    } else {
        return res.status(401).json({
            auth: false,
            command: 'You are not allowed to access to this area'
        });
    }
};

const player_assign = (playerData) => {

    if (playerData) {
        let updatePlayer = Player.findById(playerData._id)
            .then(player => {
                player.finalOffer = player.currentOffer;
                player.finalOwner = player.currentOwner;
                player.assigned = true;
                return player.save().then(player => player);
            });
        updatePlayer.then(player => {
            User.findById(player.finalOwner)
                .then(user => {
                    let wallet = user.wallet - player.finalOffer;
                    if (wallet >= 0) {
                        user.wallet = wallet;
                        user.save()
                            .then(user => {
                                let message = {player: player, user: user};
                                SocketServer.sendAll('playerReserved', message);
                                SocketServer.sendAdmin('playerReserved', message);
                            })
                    }
                })
        })
    }
};