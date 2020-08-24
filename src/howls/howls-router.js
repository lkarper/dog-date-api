const express = require('express');
const path = require('path');
const HowlsService = require('./howls-service');
const { requireAuth } = require('../middleware/jwt-auth');

const howlsRouter = express.Router();
const jsonBodyParser = express.json();

howlsRouter
    .route('/')
    .get((req, res, next) => {
        HowlsService.getAllHowls(req.app.get('db'))
            .then(howls => {
                HowlsService.getReviews(req.app.get('db'))
                    .then(reviews => {
                        const params = req.query;
                        HowlsService.filterHowls(
                            reviews,
                            howls, 
                            params
                        )
                        .then(howls => {
                            res.status(200).json(howls.map(HowlsService.serializeHowl));
                        })
                    });
            })
            .catch(next);   
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {

        const {
            howl_title,
            address,
            city,
            state,
            zipcode,
            lat,
            lon,
            date,
            meeting_type,
            personal_message,
            dog_ids,
            time_windows
        } = req.body;

        const newHowl = {
            howl_title,
            address,
            city,
            state,
            zipcode,
            date,
            meeting_type,
            personal_message,
            dog_ids,
            time_windows
        }

        for (const [key, value] of Object.entries(newHowl)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`,
                });
            }
        }

        newHowl.user_id = req.user.id;
        newHowl.lat = lat;
        newHowl.lon = lon;

        HowlsService.insertHowl(
            req.app.get('db'),
            newHowl
        )
        .then(howl => {
            res.
                status(201)
                .location(path.posix.join(req.originalUrl, `/${howl.id}`))
                .json(HowlsService.serializeHowl(howl));
        })
        .catch(next);
    });

howlsRouter
    .route('/user-saved')
    .all(requireAuth)
    .get((req, res, next) => {
        const user_id = req.user.id;
        HowlsService.getUserSavedHowls(
            req.app.get('db'),
            user_id
        )
            .then(savedHowls => {
                const arrayOfHowlIds = savedHowls.map(howl => howl.howl_id);
                HowlsService.getAllHowls(
                    req.app.get('db')
                )
                    .then(howls => {
                        const howlsToInclude = howls.filter(howl => arrayOfHowlIds.includes(howl.id));
                        res.json(savedHowls
                            .map(savedHowl => {
                                return {
                                    id: savedHowl.id,
                                    user_id: savedHowl.user_id,
                                    howl: HowlsService.serializeHowl(
                                        howlsToInclude
                                            .find(howl => howl.id === savedHowl.howl_id)
                                    ),
                                }
                            })
                        );
                    })
                    .catch(next);
            })
            .catch(next);
    })
    .post(jsonBodyParser, checkHowlExists, checkHowlIsSaved, (req, res, next) => {
        const user_id = req.user.id;
        const { howl_id } = req.body;
        const { savedHowl } = res;


        if (savedHowl) {
            HowlsService.getById(
                req.app.get('db'),
                savedHowl.howl_id
            )
                .then(howl => {
                    return res
                        .status(200)
                        .json(HowlsService.serializeHowl(howl));
                })
                .catch(next);
        } else {

            const newUserSavedHowl = {
                user_id,
                howl_id,
            };

            HowlsService.insertUserSavedHowl(
                req.app.get('db'),
                newUserSavedHowl
            )
                .then(savedHowl => {
                    HowlsService.getById(
                        req.app.get('db'), 
                        savedHowl.howl_id
                    )
                        .then(howl => {
                            res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${savedHowl.id}`))
                                .json({
                                    id: savedHowl.id,
                                    user_id: savedHowl.user_id,
                                    howl: HowlsService.serializeHowl(howl),
                                });
                        })
                        .catch(next);
                })
                .catch(next);
        }
    });

howlsRouter
    .route('/user-saved/:entry_id')
    .all(checkSavedHowlExists)
    .all(requireAuth)
    .get((req, res, next) => {
        const savedHowl = res.saved_entry;
        HowlsService.getById(
            req.app.get('db'),
            savedHowl.howl_id
        )
            .then(howl => {
                res.json({
                    id: savedHowl.id,
                    user_id: savedHowl.user_id,
                    howl: HowlsService.serializeHowl(howl),
                });
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        if (res.saved_entry.user_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorized request` });
        }
        HowlsService.deleteUserSavedHowl(
            req.app.get('db'),
            req.params.entry_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    });

howlsRouter
    .route('/:howl_id')
    .all(requireAuth)
    .all(checkHowlExists)
    .get((req, res, next) => {
        res.json(HowlsService.serializeHowl(res.howl));
    })
    .delete((req, res, next) => {
        if (res.howl.user_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorizaed request` });
        }

        HowlsService.deleteHowl(
            req.app.get('db'),
            req.params.howl_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonBodyParser, (req, res, next) => {
        if (res.howl.user_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorizaed request` });
        }

        const {
            howl_title,
            address,
            city,
            state,
            zipcode,
            lat,
            lon,
            date,
            meeting_type,
            personal_message,
            dog_ids,
            time_windows
        } = req.body;

        const howlToUpdate = {
            howl_title,
            address,
            city,
            state,
            zipcode,
            lat,
            lon,
            date,
            meeting_type,
            personal_message,
            dog_ids,
            time_windows
        };

        const numberOfValues = Object.values(howlToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'howl_title', 'address', 'city', 'state', 'zipcode', 'lat', 'lon', 'date', 'meeting_type', 'personal_message', 'dog_ids', 'time_windows'.`,
                },
            });
        }

        HowlsService.updateHowl(
            req.app.get('db'),
            req.params.howl_id,
            howlToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end();
        })
        .catch(next);
    });

async function checkHowlExists(req, res, next) {
    try {

        if (!req.params.howl_id && !req.body.howl_id) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'howl_id'.`,
                },
            });
        }
        const howl = await HowlsService.getById(
            req.app.get('db'),
            req.params.howl_id || req.body.howl_id
        );

        if (!howl) {
            return res.status(404).json({
                error: { message: `Howl doesn't exist` },
            });
        }

        res.howl = howl;
        next();
    } catch(error) {
        next(error);
    }
}

async function checkSavedHowlExists(req, res, next) {
    try {
        const savedEntry = await HowlsService.getUserSavedHowlById(
            req.app.get('db'),
            req.params.entry_id
        );

        if (!savedEntry) {
            return res.status(404).json({
                error: { message: `Saved howl doesn't exist` },
            });
        }
        res.saved_entry = savedEntry;
        next();
    } catch(error) {
        next(error);
    }
}

async function checkHowlIsSaved(req, res, next) {
    try {
        const savedHowl = await HowlsService.getUserSavedHowlByUserIdAndHowlId(
            req.app.get('db'),
            req.user.id,
            req.body.howl_id
        );

        res.savedHowl = savedHowl || null;

        next();
    } catch(error) {
        next(error);
    }
}

module.exports = howlsRouter;