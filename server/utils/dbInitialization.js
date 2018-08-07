const User = require('../model/user');

const adminCreation = (username, numAdmin = 1, adminPassword = undefined) => {
    User.find({role: 'admin'})
        .then(users => {
            if (users.length < numAdmin) {
                const administrator = new User({
                    username: username,
                    password: adminPassword || process.env.ADMIN_PASSWORD,
                    role: 'admin'
                });
                administrator.save()
                    .then(admin => console.log("Admin " + admin.username + " created"))
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
};

const piUserCreation = (username, numPiUsers = 1, password = undefined) => {
    User.find({role: 'pi'})
        .then(users => {
            if (users.length < numPiUsers) {
                const piUser = new User({
                    username: username,
                    password: password || process.env.PI_USER_PASSWORD,
                    role: 'pi'
                });
                piUser.save()
                    .then(pi => console.log("PI user " + pi.username + " created"))
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
};

module.exports = {
    adminCreation: adminCreation,
    piUserCreation: piUserCreation
};