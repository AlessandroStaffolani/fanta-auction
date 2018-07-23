const {validationResult} = require('express-validator/check');

/**
 * Questo oggetto contiene dei metodi utili per tutti i controller
 * */


/**
 * Return body as json response
 * @param req
 * @param res
 * @param next
 * @param body
 */
exports.return_request = (req, res, next, body) => {
    res.header('Content-Type', 'application/json');
    res.status(200);
    res.json(body);
};

/**
 * Return payload as json response with status 400 for malformed data
 * @param req
 * @param res
 * @param next
 * @param payload
 */
exports.return_bad_request = (req, res, next, payload = {}) => {

    let errorMessage = 'Bad request, error 400, malformed data';
    res.header('Content-Type', 'application/json');
    res.status(400);
    res.json({
        command: errorMessage,
        payload: payload
    });

};

/**
 * Get express-validators mapped object and remove location param
 * @param errorsObject
 * @returns {*}
 */
exports.reformat_errors = (errorsObject) => {

    for (let param in errorsObject) {
        delete errorsObject[param].location;
        errorsObject[param].command = errorsObject[param].msg;
        delete errorsObject[param].msg;
    }

    return errorsObject
};

/**
 * Create an error object with the same structure of express-validators
 * @param param
 * @param value
 * @param message
 * @returns {{}}
 */
exports.create_error_object = (param, message, value = '') => {

    let error = {};
    error[param] = {
        'param': param,
        "command": message
    };
    if (value !== '') {
        error[param].value = value;
    }
    return error
};

/**
 * Check if express-validation is correct, if is not return the bad request response
 * @param req
 * @param res
 * @param next
 * @param requested_object
 * @returns {boolean}
 */
exports.body_is_valid = (req, res, next, requested_object) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        let errorPayload = {
            errors: this.reformat_errors(errors.mapped()),
            requestObject: requested_object
        };
        this.return_bad_request(req, res, next, errorPayload);
        return false;
    } else {
        return true;
    }
};