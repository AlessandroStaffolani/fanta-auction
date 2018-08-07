const abstractController = require('./abstractController');
const {body} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const jsonWebToken = require('../crypto/jsonWebToken');
const jwt = require('jsonwebtoken');

const User = require('../model/user');
const ADMIN_ROLE = 'admin';

exports.login = [

    body('user')
        .exists().withMessage('No user object provided.'),
    body('user.username')
        .exists().withMessage('Username must be specified.'),
    body('user.password')
        .exists().withMessage('Password must be specified'),

    sanitizeBody('user.username').trim().escape(),
    sanitizeBody('user.password').trim().escape(),

    (req, res, next) => {

        let requested_user = req.body.user;

        if (abstractController.body_is_valid(req, res, next, requested_user)) {
            // data are correct check if user exist
            User.findOne({username: requested_user.username})
                .then(user => {
                    if (user !== null) {
                        // if user exist check password
                        user.comparePassword(requested_user.password)
                            .then(result => {
                                if (result) {
                                    // password correct return username and authenticate true
                                    abstractController.return_request(req, res, next, {
                                        authenticate: true,
                                        userId: user.id,
                                        username: user.username,
                                        role: user.role,
                                        wallet: user.wallet,
                                        buttonCode: user.buttonCode,
                                        token: jsonWebToken.generateToken(user),
                                    })
                                } else {
                                    let errorPayload = {
                                        errors: {
                                            "user.password": {
                                                param: "password",
                                                value: requested_user.password,
                                                command: 'Password is not correct'
                                            }
                                        },
                                        requestObject: requested_user
                                    };
                                    abstractController.return_bad_request(req, res, next, errorPayload);
                                }
                            })
                            .catch(err => next(err))

                    } else {
                        let errorPayload = {
                            errors: {
                                "user.username": {
                                    param: "username",
                                    value: requested_user.username,
                                    command: 'Username not exist'
                                }
                            },
                            requestObject: requested_user
                        };
                        abstractController.return_bad_request(req, res, next, errorPayload);
                    }
                })
                .catch(err => next(err));
        }
    }
];

exports.is_authenticated = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        // if no token error
        return res.header('Content-Type', 'application/json')
            .status(401)
            .json({
                auth: false,
                command: 'No authorization token provided'
            });
    }

    token = token.replace('Bearer ', '');

    jwt.verify(token, process.env.SECRET, function (err, user) {
        if (err) {
            return res.status(401).json({
                auth: false,
                command: 'Token provided is not valid'
            });
        } else {
            req.user = user; //set the user to req so other routes can use it
            next();
        }
    })
};

exports.is_admin = (req, res, next) => {
    const user = req.user;
    if (user) {
        if (user.role === ADMIN_ROLE) {
            return next();
        }
    }
    return res.status(401).json({
        auth: false,
        command: 'You are not allowed to access to this area'
    });
};
