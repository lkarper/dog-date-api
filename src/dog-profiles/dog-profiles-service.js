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
    getPackByUserId(db, user_id) {
        return db
            .from('dog_date_pack_members AS pm')
            .where('pm.user_id', user_id)
            .select(
                'pm.id',
                'pm.user_id',
                db.raw(
                    `json_build_object(
                        'id', dp.id,
                        'name', dp.name, 
                        'profile_img_url', dp.profile_img_url,
                        'age_years', dp.age_years,
                        'age_months', dp.age_months,
                        'sex', dp.sex,
                        'breed', dp.breed,
                        'weight', dp.weight,
                        'energy', dp.energy,
                        'temperment', dp.temperment,
                        'obedience', dp.obedience,
                        'dislikes_puppies', dp.dislikes_puppies,
                        'dislikes_men', dp.dislikes_men,
                        'dislikes_women', dp.dislikes_women, 
                        'dislikes_children', dp.dislikes_children,
                        'recently_adopted', dp.recently_adopted,
                        'prefers_people', dp.prefers_people,
                        'leash_aggression', dp.leash_aggression, 
                        'elderly_dog', dp.elderly_dog,
                        'little_time_with_other_dogs', dp.little_time_with_other_dogs,
                        'much_experience_with_other_dogs', dp.much_experience_with_other_dogs,
                        'aggressive', dp.aggressive,
                        'owner_description', dp.owner_description, 
                        'owner',
                                json_build_object(
                                    'id', usr.id,
                                    'username', usr.username,
                                    'email', usr.email,
                                    'phone', usr.phone
                                )
                    ) AS "profile"`
                ),
            )
            .leftJoin('dog_date_dog_profiles AS dp', 'dp.id', 'pm.pack_member_id')
            .leftJoin('dog_date_users AS usr', 'dp.owner_id', 'usr.id');
    },
    getPackMemberByUserIdAndPackMemberId(db, user_id, pack_member_id) {
        return this.getPackByUserId(db, user_id)
            .where('pm.pack_member_id', pack_member_id)
            .first();
    },
    getPackMemberById(db, id) {
        return db
            .from('dog_date_pack_members AS pm')
            .where('pm.id', id)
            .select(
                'pm.id',
                'pm.user_id',
                db.raw(
                    `json_build_object(
                        'id', dp.id,
                        'name', dp.name, 
                        'profile_img_url', dp.profile_img_url,
                        'age_years', dp.age_years,
                        'age_months', dp.age_months,
                        'sex', dp.sex,
                        'breed', dp.breed,
                        'weight', dp.weight,
                        'energy', dp.energy,
                        'temperment', dp.temperment,
                        'obedience', dp.obedience,
                        'dislikes_puppies', dp.dislikes_puppies,
                        'dislikes_men', dp.dislikes_men,
                        'dislikes_women', dp.dislikes_women, 
                        'dislikes_children', dp.dislikes_children,
                        'recently_adopted', dp.recently_adopted,
                        'prefers_people', dp.prefers_people,
                        'leash_aggression', dp.leash_aggression, 
                        'elderly_dog', dp.elderly_dog,
                        'little_time_with_other_dogs', dp.little_time_with_other_dogs,
                        'much_experience_with_other_dogs', dp.much_experience_with_other_dogs,
                        'aggressive', dp.aggressive,
                        'owner_description', dp.owner_description, 
                        'owner',
                                json_build_object(
                                    'id', usr.id,
                                    'username', usr.username,
                                    'email', usr.email,
                                    'phone', usr.phone
                                )
                    ) AS "profile"`
                ),
            )
            .leftJoin('dog_date_dog_profiles AS dp', 'dp.id', 'pm.pack_member_id')
            .leftJoin('dog_date_users AS usr', 'dp.owner_id', 'usr.id')
            .then(([profile]) => profile);
    },
    insertPackMember(db, newPackMember) {
        return db
            .insert(newPackMember)
            .into('dog_date_pack_members')
            .returning('*')
            .then(([pack_member]) => pack_member)
            .then(pack_member => 
                this.getPackMemberByUserIdAndPackMemberId(db, pack_member.user_id, pack_member.pack_member_id)
            );
    },
    removePackMember(db, id) {
        return db('dog_date_pack_members')
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
            profile_img_url: xss(profile_img_url),
            age_years,
            age_months,
            sex: xss(sex), 
            breed: xss(breed),
            weight,
            energy: xss(energy),
            temperment: xss(temperment),
            obedience: xss(obedience),
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