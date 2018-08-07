const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({
        _id: user._id.toString(),
        username: user.username,
        role: user.role,
        wallet: user.wallet,
    }, process.env.SECRET, {
        expiresIn: 60 * 60 * 24, // expires in 24 hours,
        algorithm: 'HS512'
    });
};

const getUserData = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken: generateToken,
    getUserData: getUserData,
};