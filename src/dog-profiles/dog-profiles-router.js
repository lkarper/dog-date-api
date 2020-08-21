const express = require('express');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const DogProfilesService = require('./dog-profiles-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require('../config');

const dogProfilesRouter = express.Router();
const jsonBodyParser = express.json();

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
                res.json(profiles
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
    });

dogProfilesRouter
    .route('/pack-members/:entry_id')
    .all(checkPackMemberExists)
    .all(requireAuth)
    .get((req, res, next) => {
        const pack_member = res.pack_member;
        res.json({
            id: pack_member.id,
            user_id: pack_member.user_id,
            profile: DogProfilesService.serializeProfile(pack_member.profile),
        });
    })
    .delete((req, res, next) => {
        if (res.pack_member.user_id !== req.user.id) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

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

// dogProfilesRouter
//     .route('/:dog_id/profile-photo')
//     .all(checkDogProfileExists)
//     .all(requireAuth)
//     .post((req, res, next) => { //should be patch?
//         if (res.profile.owner.id !== req.user.id) {
//             return res.status(401).json({ error: `Unauthorized request` });
//         }

//         const { profile_img } = req.body;

//         if (!profile_img) {
//             return res.status(400).json({
//                 error: {
//                     message: `Request body must contain 'profile_img'.`,
//                 },
//             });
//         }

//         getProfilePhotoUrl(profile_img)
//             .then(profile_img_url => {
//                 const profileToUpdate = { profile_img_url };
//                 return DogProfilesService.updateProfile(
//                     req.app.get('db'),
//                     req.params.dog_id,
//                     profileToUpdate
//                 );
//             })
//             .then(numRowsAffected => {
//                 res.status(204).end();
//             })
//             .catch(next);
//     })

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
            owner_description
        };

        const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'name', 'profile_img', 'age_years', 'age_months', 'sex', 'breed', 'weight', 'energy', 'temperment', 'obedience', 'dislikes_puppies', 'dislikes_men', 'dislikes_women', 'dislikes_children', 'recently_adopted', 'prefers_people', 'leash_aggression', 'elderly_dog', 'little_time_with_other_dogs', 'much_experience_with_other_dogs', 'aggressive', 'owner_description'.`,
                }
            });
        }

        getProfilePhotoUrl(profile_img)
            .then(profile_img_url => {
                let newProfileUrl;
                if (!profile_img_url && req.body.profile_img_url) {
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
                error: { message: `Dog profile doesn't exist` }
            });
        }

        res.profile = profile;
        next();
    } catch(error) {
        next(error);
    }
}

async function checkDogIsPackMember(req, res, next) {
    try {
        const pack_member = await DogProfilesService.getPackMemberByUserIdAndPackMemberId(
            req.app.get('db'),
            req.user.id,
            req.body.pack_member_id
        );

        if (pack_member) {
            return res.status(304).json({
                message: `Dog is already a pack member`,
            });
        }
        next();
    } catch(error) {
        next(error);
    }
}

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