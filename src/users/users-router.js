const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
    .route('/')
    .post(jsonParser, (req, res, next) => {
        const { 
            password, 
            username, 
            email, 
            phone 
        } = req.body;

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
    })
    .patch(requireAuth, jsonParser, (req, res, next) => {
        const {
            email,
            phone
        } = req.body;

        const userToUpdate = {
            email,
            phone
        };

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'email' or 'phone'.`,
                }
            });
        }

        if (email && email !== req.user.email) {
            UsersService.hasUserWithEmail(
                req.app.get('db'),
                email
            )
                .then(emailAlreadyExists => {
                    if (emailAlreadyExists) {
                        return res.status(400).json({ error: `Account already registered with that email` });
                    } else { 
                        return UsersService.updateUser(
                            req.app.get('db'),
                            req.user.id,
                            userToUpdate
                        )
                            .then(numRowsAffected => {
                                res.status(204).end();
                            })
                    }
                })
        } else {
            UsersService.updateUser(
                req.app.get('db'),
                req.user.id,
                userToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end();
                })
                .catch(next);
        }
    });

module.exports = usersRouter;