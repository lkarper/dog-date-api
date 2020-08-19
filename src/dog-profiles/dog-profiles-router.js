const express = require('express');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const DogProfilesService = require('./dog-profiles-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require('../config');
const { profile } = require('console');
const { resolve } = require('path');

const dogProfilesRouter = express.Router();
const jsonBodyParser = express.json();

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET, 
});

dogProfilesRouter
    .route('/user-dogs')
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
    });

dogProfilesRouter
    .route('/:dog_id')
    .all(checkDogProfileExists)
    .all(requireAuth)
    .get((req, res, next) => {
        res.json(DogProfilesService.serializeProfile(res.profile))
    })
    .delete((req, res, next) => { 
        if (res.profile.owner.id !== req.user.id) {
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
    .patch(jsonBodyParser, (req, res, next) => {
        if (res.profile.owner.id !== req.user.id) {
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
    .get((req, res, next) => {
        DogProfilesService.getAllProfiles(req.app.get('db'))
            .then(profiles => {
                res.json(profiles.map(DogProfilesService.serializeProfile));
            })
            .catch(next);
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {    
        
        const {
            name, 
            profile_img,
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
        getProfilePhotoUrl(profile_img)
            .then(profile_img_url => {
                newProfile.profile_img_url = profile_img_url;
                return DogProfilesService.insertProfile(
                    req.app.get('db'),
                    newProfile
                );
            })
            .then(profile => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${profile.id}`))
                    .json(DogProfilesService.serializeProfile(profile));
            })
            .catch(next);

        // if (profile_img) {
        //     cloudinary.uploader.upload(profile_img, (error, result) => {
        //         newProfile.profile_img_url = result.secure_url;

        //         DogProfilesService.insertProfile(
        //             req.app.get('db'),
        //             newProfile
        //         )
        //             .then(profile => {
        //                 res
        //                     .status(201)
        //                     .location(path.posix.join(req.originalUrl, `/${profile.id}`))
        //                     .json(DogProfilesService.serializeProfile(profile));
        //             })
        //             .catch(next);
        //     });
        // } else {
        //         newProfile.profile_img_url = '';

        //         DogProfilesService.insertProfile(
        //             req.app.get('db'),
        //             newProfile
        //         )
        //             .then(profile => {
        //                 res
        //                     .status(201)
        //                     .location(path.posix.join(req.originalUrl, `/${profile.id}`))
        //                     .json(DogProfilesService.serializeProfile(profile));
        //             })
        //             .catch(next);
        // }
    });

async function checkDogProfileExists(req, res, next) {
    try {
        const profile = await DogProfilesService.getById(
            req.app.get('db'),
            req.params.dog_id
        );

        if (!profile) {
            return res.status(404).json({ 
                error: { message: `Dog profile doesn't exist` }
            });
        }

        res.profile = profile;
        next();
    } catch(error) {
        next(error);
    }
}

function getProfilePhotoUrl(profile_img) {
    return new Promise((resolve, reject) => {
        if (!profile_img) {
            resolve('');
        } else { 
            cloudinary.uploader.upload(profile_img, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            });
        }
    });
}

module.exports = dogProfilesRouter;