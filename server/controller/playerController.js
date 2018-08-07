const abstractController = require('./abstractController');
const {body} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const SocketServer = require('../utils/SocketServer');

const Player = require('../model/player');

exports.load_player = [

    body('playersData')
        .exists().withMessage('No players data object provided.')
        .isArray().withMessage('Players data should be an array'),

    (req, res, next) => {
        const playersData = req.body.playersData;

        if (abstractController.body_is_valid(req, res, next, playersData)) {

            const saveErrors = [];
            const playersInserted = [];
            let savePromises = playersData.map(item => {
                let player = new Player(item);
                return player.save()
                    .then(playerSaved => playersInserted.push(playerSaved))
                    .catch(err => saveErrors.push(err))
            });

            Promise.all(savePromises)
                .then((playersSaved) => {
                    if (playersInserted.length === playersData.length) {
                        abstractController.return_request(req, res, next, {
                            playersSaved: playersInserted
                        })
                    } else {
                        abstractController.return_bad_request(req, res, next, {load: failed})
                    }
                })
                .catch(errors => {
                    abstractController.return_bad_request(req, res, next, {
                        saveErrors: saveErrors
                    })
                })

        }
    }
];

exports.next_player = [

    body('playerRole')
        .exists().withMessage('No player role provided.'),

    sanitizeBody('playerRole').trim().escape(),

    (req, res, next) => {
        const playerRole = req.body.playerRole;

        if (abstractController.body_is_valid(req, res, next, playerRole)) {

            Player.findOne({
                role: playerRole,
                assigned: false
            }, null, {sort: {player: 1}})
                .populate('currentOwner')
                .then(player => {
                    if (player === null) {
                        abstractController.return_request(req, res, next, {
                            currentPlayer: player
                        });
                    } else {
                        SocketServer.sendAll('currentPlayer', player);
                        SocketServer.sendAdmin('currentPlayer', player);
                        SocketServer.sendPiUser('initAuction', false);

                        abstractController.return_request(req, res, next, {
                            currentPlayer: player
                        });
                    }
                })
                .catch(err => abstractController.return_bad_request(req, res, next, {
                    errors: err
                }))
        }
    }
];