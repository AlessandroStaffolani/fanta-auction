const abstractController = require('./abstractController');
const {body} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const customValidator = require('../utils/customValidators');
const jsonWebToken = require('../crypto/jsonWebToken');

const User = require('../model/user');

/**
 * Find all users
 */
exports.get_all_user = (req, res, next) => {

    all_users(req, res, next);
};

/**
 * Find user by id, no password and salt
 */
exports.get_user = (req, res, next) => {

    User.findById(req.params.id, '-password -salt')
        .then(user => abstractController.return_request(req, res, next, {user: user}))
        .catch(err => next(err))
};

/**
 * Post new user
 */
exports.post_user = [

    body('user')
        .exists().withMessage('No user object provided.'),
    body('user.username')
        .exists().withMessage('Username must be specified.'),
    body('user.password')
        .exists().withMessage('Password must be specified')
        .isLength({min: 5}).withMessage('passwords must be at least 5 chars long and contain one number')
        .matches(/\d/).withMessage('passwords must be at least 5 chars long and contain one number'),

    sanitizeBody('user.username').trim().escape(),
    sanitizeBody('user.password').trim().escape(),

    (req, res, next) => {

        let requested_user = req.body.user;

        if (abstractController.body_is_valid(req, res, next, requested_user)) {
            // Data are correct, can save the object
            const user = new User({
                username: req.body.user.username,
                password: req.body.user.password
            });

            save_user(req, res, next, user, requested_user, true);
        }
    }

];

/**
 * Update user data, no password and salt
 */
exports.update_user = [

    body('user')
        .exists().withMessage('No user object provided.'),
    body('user.username')
        .exists().withMessage('Username must be specified.'),
    body('user.oldPassword')
        .custom(value => customValidator.isLengthIfExist(value, 5))
        .withMessage('passwords must be at least 5 chars long and contain one number')
        .custom(value => customValidator.matchIfExist(value, /\d/))
        .withMessage('passwords must be at least 5 chars long and contain one number'),
    body('user.newPassword')
        .custom(value => customValidator.isLengthIfExist(value, 5))
        .withMessage('passwords must be at least 5 chars long and contain one number')
        .custom(value => customValidator.matchIfExist(value, /\d/))
        .withMessage('passwords must be at least 5 chars long and contain one number'),

    sanitizeBody('user.username').trim().escape(),
    sanitizeBody('user.oldPassword').trim().escape(),
    sanitizeBody('user.newPassword').trim().escape(),

    (req, res, next) => {

        let requested_user = req.body.user;

        if (abstractController.body_is_valid(req, res, next, requested_user)) {
            // Data are correct, can save the object
            User.findById(req.params.id)
                .then(user => {
                    // User exist, now compare old password
                    if (req.body.user.oldPassword.length > 0) {
                        user.comparePassword(req.body.user.oldPassword)
                            .then(passwordMatch => {

                                if (passwordMatch) {
                                    // password match can update the user
                                    user.password = req.body.user.newPassword;
                                    user.username = req.body.user.username;

                                    save_user(req, res, next, user, requested_user);
                                } else {
                                    let errorPayload = {
                                        errors: abstractController.create_error_object(
                                            'oldPassword',
                                            'The old password provided is not correct',
                                            req.body.user.oldPassword,
                                        ),
                                        requestObject: requested_user
                                    };
                                    abstractController.return_bad_request(req, res, next, errorPayload);
                                }
                            })
                            .catch(err => next(err));
                    } else {
                        user.username = req.body.user.username;

                        save_user(req, res, next, user, requested_user);
                    }

                })
                .catch(err => next(err));
        }
    }
];

/**
 * Reset user password
 */
exports.reset_user_password = [

    body('user')
        .exists().withMessage('No user object provided.'),
    body('user.username')
        .exists().withMessage('Username must be specified.'),
    body('user.oldPassword')
        .exists().withMessage('OldPassword must be specified')
        .isLength({min: 5}).withMessage('passwords must be at least 5 chars long and contain one number')
        .matches(/\d/).withMessage('passwords must be at least 5 chars long and contain one number'),
    body('user.newPassword')
        .exists().withMessage('NewPassword must be specified')
        .isLength({min: 5}).withMessage('passwords must be at least 5 chars long and contain one number')
        .matches(/\d/).withMessage('passwords must be at least 5 chars long and contain one number'),

    sanitizeBody('user.username').trim().escape(),
    sanitizeBody('user.oldPassword').trim().escape(),
    sanitizeBody('user.newPassword').trim().escape(),

    (req, res, next) => {

        let requested_user = req.body.user;
        console.log(requested_user);

        if (abstractController.body_is_valid(req, res, next, requested_user)) {
            User.findById(req.params.id)
                .then(user => {

                    if (user.username === req.body.user.username) {

                        user.comparePassword(req.body.user.oldPassword)
                            .then(passwordMatch => {

                                if (passwordMatch) {
                                    user.password = req.body.user.newPassword;
                                    save_user(req, res, next, user, requested_user);
                                } else {
                                    let errorPayload = {
                                        errors: abstractController.create_error_object(
                                            'oldPassword',
                                            'The old password provided is not correct',
                                            req.body.user.oldPassword,
                                        ),
                                        requestObject: requested_user
                                    };
                                    abstractController.return_bad_request(req, res, next, errorPayload);
                                }
                            })
                            .catch(err => next(err));

                    } else {
                        let errorPayload = {
                            errors: abstractController.create_error_object(
                                'username',
                                'The username provided doesn\'t match',
                                req.body.user.username,
                            ),
                            requestObject: requested_user
                        };
                        abstractController.return_bad_request(req, res, next, errorPayload);
                    }

                })
                .catch(err => next(err));
        }
    }
];

/**
 * Delete user by id
 */
exports.delete_user = (req, res, next) => {

    User.findByIdAndDelete(req.params.id)
        .then(deletedUser => abstractController.return_request(req, res, next, {deletedUser: deletedUser}))
        .catch(err => next(err))
};

/**
 * Save user data
 * @param req
 * @param res
 * @param next
 * @param user
 * @param requested_user
 * @param addToken
 */
const save_user = (req, res, next, user, requested_user, addToken=false) => {
    user.save()
        .then(userObject => {
            let returnObject = {user: userObject};
            if (addToken) {
                returnObject.token = jsonWebToken.generateToken(userObject);
            }
            abstractController.return_request(req, res, next, returnObject)
        })
        .catch(err => {
            if (err.status === 400) {
                let errorPayload = {
                    errors: {
                        "user.username": {
                            param: "username",
                            value: requested_user.username,
                            command: err.command
                        }
                    },
                    requestObject: requested_user
                };
                abstractController.return_bad_request(req, res, next, errorPayload);
            } else {
                next(err);
            }
        })
};

/**
 * Get all user checking if should use active to filter
 * @param req
 * @param res
 * @param next
 * @param active
 */
const all_users = (req, res, next, active = undefined) => {

    let findFilter = {};
    if (active !== undefined) {
        findFilter = {
            active: active
        }
    }

    User.find(findFilter, '-password -salt')
        .then(users => {
            abstractController.return_request(req, res, next, {users: users})
        })
        .catch(err => next(err))
};