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
                            res.status(200).json(howls);
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
                .json(howl);
        })
        .catch(next);
    });

howlsRouter
    .route('/:howl_id')
    .all(requireAuth)
    .all(checkHowlExists)
    .get((req, res, next) => {
        res.json(res.howl);
    });

async function checkHowlExists(req, res, next) {
    try {
        const howl = await HowlsService.getById(
            req.app.get('db'),
            req.params.howl_id
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

module.exports = howlsRouter;