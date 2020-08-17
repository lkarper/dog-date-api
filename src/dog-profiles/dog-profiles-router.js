const express = require('express');
const path = require('path');
const DogProfilesService = require('./dog-profiles-service');
const { requireAuth } = require('../middleware/jwt-auth');

const dogProfilesRouter = express.Router();
const jsonBodyParser = express.json();

dogProfilesRouter
    .route('/:dog_id')
    .all(checkDogProfileExists)
    .get((req, res, next) => {
        res.json(DogProfilesService.serializeProfile(res.profile))
    })
    .delete(requireAuth, (req, res, next) => { 
        if (res.profile.owner_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorized request` });
        }
        
        DogProfilesService.deleteProfile(
            req.app.get('db'),
            req.params.dog_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(requireAuth, jsonBodyParser, (req, res, next) => {
        if (res.profile.owner_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

        const {
            name, 
            profile_img_url,
            age_years,
            age_months,
            sex, 
            breed,
            weight,
            energy,
            temperment,
            obedience,
            dislikes_puppies,
            dislikes_men,
            dislikes_women,
            dislikes_children,
            recently_adopted,
            prefers_people,
            leash_aggression,
            elderly_dog,
            little_time_with_other_dogs,
            much_experience_with_other_dogs,
            aggressive,
            owner_description
        } = req.body;

        const profileToUpdate = {
            name, 
            profile_img_url,
            age_years,
            age_months,
            sex, 
            breed,
            weight,
            energy,
            temperment,
            obedience,
            dislikes_puppies,
            dislikes_men,
            dislikes_women,
            dislikes_children,
            recently_adopted,
            prefers_people,
            leash_aggression,
            elderly_dog,
            little_time_with_other_dogs,
            much_experience_with_other_dogs,
            aggressive,
            owner_description
        };

        const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'name', 'profile_img_url', 'age_years', 'age_months', 'sex', 'breed', 'weight', 'energy', 'temperment', 'obedience', 'dislikes_puppies', 'dislikes_men', 'dislikes_women', 'dislikes_children', 'recently_adopted', 'prefers_people', 'leash_aggression', 'elderly_dog', 'little_time_with_other_dogs', 'much_experience_with_other_dogs', 'aggressive', 'owner_description'.`,
                }
            });
        }

        DogProfilesService.updateProfile(
            req.app.get('db'),
            req.params.dog_id,
            profileToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    })

dogProfilesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const user_id = req.user.id;
        DogProfilesService.getByOwnerId(
            req.app.get('db'),
            user_id
        )
            .then(profiles => {
                res.json(profiles.map(DogProfilesService.serializeProfile));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {
            name, 
            profile_img_url,
            age_years,
            age_months,
            sex, 
            breed,
            weight,
            energy,
            temperment,
            obedience,
            dislikes_puppies,
            dislikes_men,
            dislikes_women,
            dislikes_children,
            recently_adopted,
            prefers_people,
            leash_aggression,
            elderly_dog,
            little_time_with_other_dogs,
            much_experience_with_other_dogs,
            aggressive,
            owner_description
        } = req.body;

        const newProfile = {
            name, 
            profile_img_url,
            age_years,
            age_months,
            sex, 
            breed,
            weight,
            energy,
            temperment,
            obedience,
            dislikes_puppies,
            dislikes_men,
            dislikes_women,
            dislikes_children,
            recently_adopted,
            prefers_people,
            leash_aggression,
            elderly_dog,
            little_time_with_other_dogs,
            much_experience_with_other_dogs,
            aggressive,
            owner_description
        };

        for (const [key, value] of Object.entries(newProfile)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`,
                });
            }
        }

        newProfile.owner_id = req.user.id;

        DogProfilesService.insertProfile(
            req.app.get('db'),
            newProfile
        )
            .then(profile => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${profile.id}`))
                    .json(DogProfilesService.serializeProfile(profile));
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