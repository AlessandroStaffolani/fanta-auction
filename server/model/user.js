const mongoose = require("mongoose");
const cryptoPassword = require('../crypto/password');

const Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        salt: {type: String},
        created_at: {type: Date, default: Date.now()},
        role: {type: String, enum: ['user', 'admin'], default: 'user'},
        wallet: {type: Number, default: 100},
    }
);

/**
 * Check if candidatePassword is equal with user password
 * @param candidatePassword
 * @returns {Promise}
 */
UserSchema.methods.comparePassword = function (candidatePassword) {
    return cryptoPassword.verify_password(candidatePassword, this.salt, this.password)
};

const UserModel = mongoose.model("User", UserSchema);

/**
 * Hock that check if username exist
 */
UserSchema.pre('save', function () {

    return new Promise((resolve, reject) => {
        // only check email exist if it has been modified (or is new)
        if (!this.isModified('username')) resolve();

        let user = this;

        UserModel.find({username: user.username})
            .then(docs => {
                if (!docs.length) {
                    resolve()
                } else {
                    let err = new Error("User username already exists!");
                    err.status = 400;
                    reject(err);
                }
            })
    });
});

/**
 * Hock to generate hash and salt of the user password, only if is new
 */
UserSchema.pre('save', function (next) {

    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    cryptoPassword.hash_password(this.password)
        .then(result => {
            this.password = result.digest;
            this.salt = result.salt;
            next();
        })
        .catch(err => next(err));
});

//Export model
module.exports = UserModel;