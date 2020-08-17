const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {
    getUserWithUserName(db, username) {
        return db('dog_date_users')
            .where({ username })
            .first();
    },
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash);
    },
    createJWT(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            expiresIn: config.JWT_EXPIRY,
            algorithm: 'HS256',
        });
    },
    verifyJWT(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        });
    },
};

module.exports = AuthService;