
const validateRequiredInput = (object, value) => {
    let hasError = false;
    if (value === '') {
        hasError = true;
        object.className = 'form-control is-invalid';
        object.errorMsg = 'Field is required';
    } else {
        object.className = 'form-control';
        object.errorMsg = '';
    }

    return {
        hasError,
        object
    };
};

const validateRangeInteger = (object, value, min, max) => {
    let hasError = false;
    if (isNaN(value)) {
        hasError = true;
        object.className = 'form-control is-invalid';
        object.errorMsg = 'Field should be a number';
    } else {
        if (parseInt(value) < min && parseInt(value) > max) {
            hasError = true;
            object.className = 'form-control is-invalid';
            object.errorMsg = 'Field should be between ' + min + ' and ' + max;
        } else {
            object.className = 'form-control';
            object.errorMsg = '';
        }
    }

    return {
        hasError,
        object
    };
};

export { validateRequiredInput, validateRangeInteger }