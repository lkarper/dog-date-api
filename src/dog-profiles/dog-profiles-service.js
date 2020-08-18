const xss = require('xss');

const DogProfilesService = {
    getAllProfiles(db) {
        return db
            .from('dog_date_dog_profiles as dp')
            .select(
                'dp.id', 
                'dp.name', 
                'dp.profile_img_url',
                'dp.age_years',
                'dp.age_months',
                'dp.sex', 
                'dp.breed',
                'dp.weight',
                'dp.energy',
                'dp.temperment',
                'dp.obedience',
                'dp.dislikes_puppies',
                'dp.dislikes_men',
                'dp.dislikes_women',
                'dp.dislikes_children',
                'dp.recently_adopted',
                'dp.prefers_people',
                'dp.leash_aggression',
                'dp.elderly_dog',
                'dp.little_time_with_other_dogs',
                'dp.much_experience_with_other_dogs',
                'dp.aggressive',
                'dp.owner_description',
                db.raw(
                    `json_strip_nulls(
                        json_build_object(
                            'id', usr.id,
                            'username', usr.username,
                            'email', usr.email,
                            'phone', usr.phone
                        )
                    ) AS "owner"`
                ),
            )
            .leftJoin('dog_date_users AS usr', 'dp.owner_id', 'usr.id')
    },
    getById(db, id) {
        return this.getAllProfiles(db)
            .where('dp.id', id )
            .first();
    },
    getByOwnerId(db, owner_id) {
        return this.getAllProfiles(db)
            .where('usr.id', owner_id )
            .orderBy('name');
    },
    insertProfile(db, newProfile) {
        return db
            .insert(newProfile)
            .into('dog_date_dog_profiles')
            .returning('*')
            .then(([profile]) => profile)
            .then(profile => this.getById(db, profile.id));
    },
    updateProfile(db, id, newProfileFields) {
        return db('dog_date_dog_profiles')
            .where({ id })
            .update(newProfileFields);
    },
    deleteProfile(db, id) {
        return db('dog_date_dog_profiles')
            .where({ id })
            .delete();
    },
    serializeProfile(profile) {
        const {
            id,
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
        } = profile;

        return {
            id,
            name: xss(name), 
            profile_img_url,
            age_years,
            age_months,
            sex, 
            breed: xss(breed),
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
            owner_description: xss(owner_description),
            owner: {
                id: profile.owner.id,
                email: xss(profile.owner.email),
                username: xss(profile.owner.username),
                phone: xss(profile.owner.phone),
            }
        };
    },
}

module.exports = DogProfilesService;