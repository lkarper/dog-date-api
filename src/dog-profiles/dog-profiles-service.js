const xss = require('xss');

const DogProfilesService = {
    getAllProfiles(db) {
        return db
            .from('dog_date_dog_profiles')
            .select('*');
    },
    getById(db, id) {
        return this.getAllProfiles(db)
            .where({ id })
            .first();
    },
    getByOwnerId(db, owner_id) {
        return this.getAllProfiles(db)
            .where({ owner_id })
            .orderBy('name');
    },
    serializeProfile(profile) {
        const {
            id,
            owner_id, 
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
            owner_id, 
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
        };
    },
}

module.exports = DogProfilesService;