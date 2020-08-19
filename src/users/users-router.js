const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
    .post('/', jsonParser, (req, res, next) => {
        const { password, username, email, phone } = req.body;
        for (const field of ['password', 'username', 'email']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`,
                });
            }
        }

        const passwordError = UsersService.validatePassword(password);
        
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }
        
        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(emailAlreadyExists => {
                if (emailAlreadyExists) {
                    return res.status(400).json({ error: `Account already registered with that email` });
                } else {
                    UsersService.hasUserWithUsername(
                        req.app.get('db'),
                        username
                    )
                        .then(hasUserWithUserName => {
                            if (hasUserWithUserName) {
                                return res.status(400).json({ error: `Username already taken` });
                            }
            
                            return UsersService.hashPassword(password)
                                .then(hashedPassword => {
            
                                    const newUser = {
                                        username,
                                        password: hashedPassword,
                                        email,
                                        phone,
                                    };
            
                                    return UsersService.insertUser(
                                        req.app.get('db'),
                                        newUser
                                    )
                                        .then(user => {
                                            res
                                                .status(201)
                                                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                                .json(UsersService.serializeUser(user));
                                        });
                                    });
                        });
                }
            })
            .catch(next);
    });

module.exports = usersRouter;