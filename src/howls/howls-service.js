const HowlsService = {
    getAllHowls(db) {
        return db
            .from('dog_date_howls AS ddh')
            .select(
                'ddh.id',
                'ddh.user_id',
                'ddh.howl_title',
                'ddh.date',
                'ddh.meeting_type',
                'ddh.personal_message',
                db.raw(
                    `(
                        select array_to_json(
                            array_agg(row_to_json(h))
                        ) from (
                            select dog_id, json_strip_nulls(
                                json_build_object(
                                    'id', usr.id,
                                    'username', usr.username,
                                    'email', usr.email,
                                    'phone', usr.phone
                                )
                            ) AS "owner", (
                                select json_build_object(
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
                                    'owner_description', dp.owner_description
                                ) AS "profile"
                                from dog_date_dog_profiles as dp
                                where dp.id=dih.dog_id
                            )
                            from dog_date_dogs_in_howls AS dih
                            where dih.howl_id=ddh.id
                        ) h
                    ) as dogs`
                ),
                db.raw(
                    `json_strip_nulls(
                        json_build_object(
                            'address', ddh.address,
                            'city', ddh.city,
                            'state', ddh.state, 
                            'zipcode', ddh.zipcode,
                            'lat', ddh.lat,
                            'lon', ddh.lon
                        )
                    ) AS "location"`
                ),
                db.raw(
                    `(
                        select array_to_json(
                            array_agg(row_to_json(h))
                        ) from (
                            select day_of_week, start_time, end_time
                            from dog_date_time_windows AS tw
                            where tw.howl_id=ddh.id
                        ) h
                    ) as time_windows`
                )
            )
            .leftJoin('dog_date_users AS usr', 'ddh.user_id', 'usr.id');
    },
    getById(db, id) {
        return this.getAllHowls(db)
            .where('ddh.id', id)
            .first();
    },
    insertHowl(db, newHowl) {
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
            time_windows,
            user_id
        } = newHowl;

        const baseHowl = {
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
            user_id
        };

        let howlId;

        return db.transaction(function(trx) {
            return trx
                .insert(baseHowl, 'id')
                .into('dog_date_howls')
                .then(ids => {
                    howlId = ids[0];
                    const dogs = dog_ids.map((dog_id) => {
                            return {
                                howl_id: ids[0],
                                dog_id,
                            };
                    });
                    return trx('dog_date_dogs_in_howls').insert(dogs);
                })
                .then(() => {
                    const windows = time_windows.map(window => {
                        return {
                            howl_id: howlId,
                            ...window,
                        };
                    });
                    return trx('dog_date_time_windows').insert(windows);
                });
        })
        .then(inserts => this.getById(db, howlId))
        .catch(error => console.error(error))
    },

};

module.exports = HowlsService;