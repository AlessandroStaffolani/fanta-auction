
exports.isLengthIfExist = (value, min) => {
    if (value.length > 0 && value.length < min) {
        return false;
    }
    return true;
};

exports.matchIfExist = (value, regex) => {
    if (value.length > 0 && !value.match(regex)) {
        return false;
    }
    return true;
};