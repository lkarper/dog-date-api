const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const { 
            password, 
            username, 
            email, 
            phone, 
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
        
        // First, checks whether email is already linked with an account or username is already in use
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
            
                            /* 
                                If username is not in use and email is not linked to an account,
                                first hash password for storage in database
                            */
                            return UsersService.hashPassword(password)
                                .then(hashedPassword => {
                                    const newUser = {
                                        username,
                                        password: hashedPassword,
                                        email,
                                        phone,
                                    };
            
                                    // Insert user with hashed password into table
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
    .patch(requireAuth, jsonBodyParser, (req, res, next) => {
        // Update email or phone number
        const {
            email,
            phone,
        } = req.body;

        const userToUpdate = {
            email,
            phone,
        };

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'email' or 'phone'.`,
                },
            });
        }

        if (email && email !== req.user.email) {
            // If user attempts to update email, Verify that email is not already in use 
            UsersService.hasUserWithEmail(
                req.app.get('db'),
                email
            )
                .then(emailAlreadyExists => {
                    if (emailAlreadyExists) {
                        return res.status(400).json({ error: `Account already registered with that email` });
                    } else {
                        // If email is not already in use, update user
                        return UsersService.updateUser(
                            req.app.get('db'),
                            req.user.id,
                            userToUpdate
                        )
                            .then(numRowsAffected => {
                                res.status(204).end();
                            });
                    }
                });
        } else {
            // If user does not attempt to update email, simply update user
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
