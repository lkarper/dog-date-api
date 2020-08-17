const express = require('express');
const DogProfilesService = require('./dog-profiles-service');
const { requireAuth } = require('../middleware/jwt-auth');

const dogProfilesRouter = express.Router();

dogProfilesRouter
    .route('/:dog_id')
    .all(checkDogProfileExists)
    .get((req, res) => {
        res.json(DogProfilesService.serializeProfile(res.profile))
    })
    .get();

dogProfilesRouter
    .route('/')
    .get(requireAuth, (req, res, next) => {
        const user_id = req.user.id;
        DogProfilesService.getByOwnerId(
            req.app.get('db'),
            user_id
        )
            .then(profiles => {
                res.json(profiles.map(DogProfilesService.serializeProfile));
            })
            .catch(next);
    });

async function checkDogProfileExists(req, res, next) {
    try {
        const profile = await DogProfilesService.getById(
            req.app.get('db'),
            req.params.dog_id
        );

        if (!profile) {
            return res.status(404).json({ error: `Dog profile doesn't exist` });
        }

        res.profile = profile;
        next();
    } catch(error) {
        next(error);
    }
}

module.exports = dogProfilesRouter;