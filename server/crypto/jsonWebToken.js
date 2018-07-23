const jwt = require('jsonwebtoken');

console.log(process.env.SECRET);
const generateToken = (user) => {
    return jwt.sign({
        _id: user._id.toString(),
        username: user.username,
        role: user.role,
    }, process.env.SECRET, {
        expiresIn: 60 * 60, // expires in 1 hour,
        algorithm: 'HS512'
    });
};

module.exports = {
    generateToken: generateToken
};