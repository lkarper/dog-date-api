const xss = require('xss');
const bcrypt = require('bcryptjs');

/* 
    REGEX to test password meets following requirements:
        1. Contains at least 1 upper case letter
        2. Contains at least 1 lower case letter
        3. Contains at least 1 number
        4. Contains at least 1 special character
*/
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    validatePassword(password) {
        if (password.length < 8) {
            return `Password must be at least 8 characters`;
        }
        if (password.length > 72) {
            return `Password must be less than 72 characters`;
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case letter, lower case letter, number and special character';
        }
        return null;
    },
    hasUserWithUsername(db, username) {
        return db('dog_date_users')
            .where({ username })
            .first()
            .then(user => !!user);
    },
    hasUserWithEmail(db, email) {
        return db('dog_date_users')
            .where({ email })
            .first()
            .then(email => !!email);
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('dog_date_users')
            .returning('*')
            .then(([user]) => user);
    },
    serializeUser(user) {
        return {
            id: user.id,
            username: xss(user.username),
            email: xss(user.email),
            phone: xss(user.phone)
        };
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12);
    },
    updateUser(db, id, newUserFields) {
        return db('dog_date_users')
            .where({ id })
            .update(newUserFields);
    },
};

module.exports = UsersService;
