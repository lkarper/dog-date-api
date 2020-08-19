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
                res.json(howls);
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

module.exports = howlsRouter;