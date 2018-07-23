
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

export { validateRequiredInput }