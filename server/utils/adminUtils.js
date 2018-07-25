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

module.exports = {
    adminCreation: adminCreation
};