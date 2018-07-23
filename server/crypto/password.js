const crypto = require('crypto');
const configOptions = require('../config/config');

const config = {
    hashBytes: configOptions.passwordConfig.hashBytes, // size of the generated hash
    saltBytes: configOptions.passwordConfig.saltBytes, // size of the salt
    iterations: configOptions.passwordConfig.iterations // number of iteration
};

/**
 * Generate new salt using config
 * @returns {Promise<any>}
 */
exports.generate_salt = () => {

    return new Promise((resolve, reject) => {
        crypto.randomBytes(config.saltBytes, (err, salt) => {
            if (err) {
                reject(err);
            }

            resolve(salt.toString('hex'));
        })
    })

};

/**
 * Generate hash of the password provided
 * @param password
 * @returns {Promise<any>}
 */
exports.hash_password = (password) => {

    let saltPromise = this.generate_salt();

    return new Promise((resolve, reject) => {

        saltPromise
            .then(salt => {

                crypto.pbkdf2(password, salt, config.iterations, config.hashBytes, 'sha512', (err, derivedKey) => {
                    if (err) {
                        reject(err);
                    }

                    resolve({
                        salt: salt,
                        digest: derivedKey.toString('hex')
                    })
                })

            })
            .catch(err => reject(err));

    })

};

/**
 * Check if candidatePassword is the same of the password stored
 * @param candidatePassword
 * @param salt
 * @param password
 * @returns {Promise<any>}
 */
exports.verify_password = (candidatePassword, salt, password) => {

    return new Promise((resolve, reject) => {

        crypto.pbkdf2(candidatePassword, salt, config.iterations, config.hashBytes, 'sha512', (err, verify) => {
            if (err) {
                reject(err);
            }

            if (verify.toString('hex') === password) {
                resolve(true);
            } else {
                resolve(false);
            }

        })

    })

};