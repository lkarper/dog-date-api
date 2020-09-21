const express = require('express');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const DogProfilesService = require('./dog-profiles-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require('../config');

const dogProfilesRouter = express.Router();
const jsonBodyParser = express.json({ limit: '10mb' });

// Configure Cloudinary SDK to upload photos with Cloudinary api
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET, 
});

dogProfilesRouter
    .route('/pack-members')
    .all(requireAuth)
    .get((req, res, next) => {
        const user_id = req.user.id;
        DogProfilesService.getPackByUserId(
            req.app.get('db'),
            user_id
        )
            .then(profiles => {
                res.json(
                    profiles
                        .map(profile => {
                            return {
                                id: profile.id,
                                user_id: profile.user_id,
                                profile: DogProfilesService.serializeProfile(profile.profile),
                            };
                        })
                );
            })
            .catch(next);
    })
    .post(jsonBodyParser, checkDogProfileExists, checkDogIsPackMember, (req, res, next) => {
        const user_id = req.user.id;
        const { pack_member_id } = req.body;
        const { pack_member } = res;

        /* 
            If a dog is already a pack member, simply return the pack member's info;
            otherwise insert a new pack member into table
        */
        if (pack_member) {
            return res
                .status(200)
                .json({
                    id: pack_member.id,
                    user_id: pack_member.user_id,
                    profile: DogProfilesService.serializeProfile(pack_member.profile),
                });
        } else {
            const newPackMember = {
                user_id,
                pack_member_id
            };

            DogProfilesService.insertPackMember(
                req.app.get('db'),
                newPackMember
            )
                .then(pack_member => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${pack_member.id}`))
                        .json({
                            id: pack_member.id,
                            user_id: pack_member.user_id,
                            profile: DogProfilesService.serializeProfile(pack_member.profile),
                        });
                })
                .catch(next);
        }
    });

dogProfilesRouter
    .route('/pack-members/:entry_id')
    .all(checkPackMemberExists)
    .all(requireAuth)
    .all(checkAuthorization)
    .get((req, res, next) => {
        const pack_member = res.pack_member;
        res.json({
            id: pack_member.id,
            user_id: pack_member.user_id,
            profile: DogProfilesService.serializeProfile(pack_member.profile),
        });
    })
    .delete((req, res, next) => {
        DogProfilesService.removePackMember(
            req.app.get('db'),
            req.params.entry_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next);
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
        // Verify that the user making the delete request owns the profile to be deleted
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
        // Verify that the user making the patch request owns the profile to be updated
        if (res.profile.owner.id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

        const {
            name, 
            profile_img,
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
            owner_description,
        } = req.body;

        const profileToUpdate = {
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
            owner_description,
        };

        const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'name', 'profile_img', 'profile_img_url', 'age_years', 'age_months', 'sex', 'breed', 'weight', 'energy', 'temperment', 'obedience', 'dislikes_puppies', 'dislikes_men', 'dislikes_women', 'dislikes_children', 'recently_adopted', 'prefers_people', 'leash_aggression', 'elderly_dog', 'little_time_with_other_dogs', 'much_experience_with_other_dogs', 'aggressive', 'owner_description'.`,
                }
            });
        }

        getProfilePhotoUrl(profile_img)
            .then(profile_img_url => {
                let newProfileUrl;
                if (!profile_img_url && req.body.profile_img_url) {
                    // If a user updates a profile, but does not add a new photo, use the old photo url
                    newProfileUrl = req.body.profile_img_url;
                } else {
                    newProfileUrl = profile_img_url;
                }
                profileToUpdate.profile_img_url = newProfileUrl;
                return DogProfilesService.updateProfile(
                    req.app.get('db'),
                    req.params.dog_id,
                    profileToUpdate
                );
            })
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    });

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
            owner_description,
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
            owner_description,
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
    });

async function checkDogProfileExists(req, res, next) {
    try {
        if (!req.params.dog_id && !req.body.pack_member_id) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'pack_member_id'`,
                },
            });
        }

        const profile = await DogProfilesService.getById(
            req.app.get('db'),
            req.params.dog_id || req.body.pack_member_id
        );

        if (!profile) {
            return res.status(404).json({ 
                error: { message: `Dog profile doesn't exist` },
            });
        }

        res.profile = profile;
        next();
    } catch(error) {
        next(error);
    }
}

// Check to see if dog is already a pack member before attempting to add the pack member (by user_id and pack_member_id)
async function checkDogIsPackMember(req, res, next) {
    try {
        const pack_member = await DogProfilesService.getPackMemberByUserIdAndPackMemberId(
            req.app.get('db'),
            req.user.id,
            req.body.pack_member_id
        );

        res.pack_member = pack_member || null;
        next();
    } catch(error) {
        next(error);
    }
}

// Check to see if an entry in dog_date_pack_members exists (uses id of row)
async function checkPackMemberExists(req, res, next) {
    try {
        const pack_member = await DogProfilesService.getPackMemberById(
            req.app.get('db'),
            req.params.entry_id,
        );

        if (!pack_member) {
            return res.status(404).json({ 
                error: { message: `Pack member doesn't exist` }
            });
        }

        res.pack_member = pack_member;
        next();
    } catch(error) {
        next(error);
    }
}

// Verifies that a user attempting to modify an entry created the entry in dog_date_pack_members
function checkAuthorization(req, res, next) {
    try {
        if (res.pack_member && res.pack_member.user_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorized request` });
        }
        next();
    } catch(error) {
        next(error);
    }
}

// Uploads an image to Cloudinary and returns the image url for insertion into dog_date_dog_profiles
function getProfilePhotoUrl(profile_img) {
    return new Promise((resolve, reject) => {
        if (!profile_img) {
            // If an image is not provided, simply return an empty string for insertion into table
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
