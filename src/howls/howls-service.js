const xss = require('xss');
const moment = require('moment');

const HowlsService = {
    getReviews(db) {
        return db
            .from('dog_date_reviews')
            .select('*');
    },
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
    deleteHowl(db, id) {
        return db('dog_date_howls')
            .where({ id })
            .delete();
    },
    updateHowl(db, id, newHowlFields) {
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
        } = newHowlFields;

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

        return db.transaction(function(trx) {
            return trx('dog_date_howls')
                .where({ id })
                .update(baseHowl)
                .then(() => {
                    if (dog_ids) {
                        return trx('dog_date_dogs_in_howls')
                            .where('howl_id', id)
                            .delete();
                    }
                    return
                })
                .then(() => {
                    if (dog_ids) {
                        const dogs = dog_ids.map((dog_id) => {
                            return {
                                howl_id: id,
                                dog_id,
                            };
                        });
                        return trx('dog_date_dogs_in_howls').insert(dogs);
                    }
                    return
                })
                .then(() => {
                    if (time_windows) {
                        return trx('dog_date_time_windows')
                            .where('howl_id', id)
                            .delete();
                    }
                    return
                })
                .then(() => {
                    if (time_windows) {
                        const windows = time_windows.map(window => {
                            return {
                                howl_id: id,
                                ...window,
                            };
                        });
                        return trx('dog_date_time_windows').insert(windows);
                    }
                    return;
                });
        })
        .catch(error => console.error(error));
    },
    getUserSavedHowls(db, user_id) {
        return db('dog_date_user_saved_howls')
            .where({ user_id });
    },
    insertUserSavedHowl(db, newSavedHowl) {
        return db('dog_date_user_saved_howls')
            .insert(newSavedHowl)
            .returning('*')
            .then(([savedHowl]) => savedHowl);
    },
    getUserSavedHowlByUserIdAndHowlId(db, user_id, howl_id) {
        return db('dog_date_user_saved_howls')
            .where({
                user_id,
                howl_id
            })
            .first();
    },
    getUserSavedHowlById(db, id) {
        return db('dog_date_user_saved_howls')
            .where({ id })
            .first();
    },
    deleteUserSavedHowl(db, id) {
        return db('dog_date_user_saved_howls')
            .where({ id })
            .delete();
    },
    filterHowls(reviews, howls, params) {
        return new Promise((res, rej) => {
            let filteredHowls = [...howls];
            const {
                state,
                zipcode,
                rating_filter,
                type_of_meeting,
                days_of_week = '',
                recurring_meeting_windows = '',
                date,
                time_windows = ''
            } = params;

            const daysOfWeek = days_of_week ? days_of_week.split('|') : [];
            const recurringMeetingWindows = recurring_meeting_windows 
                ?
                    recurring_meeting_windows
                        .split('|')
                        .map(window => window.split(","))
                        .map(windowArray => {
                            return {
                                [windowArray[0]]: {
                                    dayOfWeek: windowArray[1],
                                    startTime: windowArray[2],
                                    endTime: windowArray[3]
                                }
                            }
                        }) 
                : 
                    [];
            const timeWindows = time_windows 
                ? 
                    time_windows
                        .split('|')
                        .map(window => window.split(","))
                        .map(windowArray => {
                            return {
                                startTime: windowArray[0],
                                endTime: windowArray[1],
                            };
                        })
                : 
                    [];

            if (state) {
                filteredHowls = filteredHowls.filter(howl => howl.location.state === state);
            }
            if (zipcode) {
                filteredHowls = filteredHowls.filter(howl => howl.location.zipcode === zipcode);
            }
            if (rating_filter) {
                const arrayOfPassingDogIds = filteredHowls
                    .filter(howl => howl.dogs && howl.dogs.length !== 0)
                    .map(howl => howl.dogs.map(dog => dog.dog_id))
                    .flat()
                    .map(dog_id => 
                        reviews.filter(review => review.dog_id === dog_id)
                    )
                    .filter(arrayOfReviews => 
                        this.calculateAverageWithArrayOfReviews(arrayOfReviews) >= parseInt(rating_filter)
                    )
                    .map(arrayOfReviews => arrayOfReviews[0].dog_id);
                filteredHowls = filteredHowls
                        .filter(howl => howl.dogs)
                        .filter(howl => {
                            let includeHowl = false;
                            arrayOfPassingDogIds.forEach(passing_id => {
                                if (howl.dogs.find(dog => dog.dog_id === passing_id)) {
                                    includeHowl = true;
                                }
                            });
                            return includeHowl;
                        });
            } 
            if (type_of_meeting) {
                filteredHowls = filteredHowls.filter(howl => howl.meeting_type === type_of_meeting);
            }
            if (daysOfWeek.length !==0) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'recurring') {
                        let includeHowl = false;
                        howl.time_windows.forEach(window => {
                            if (daysOfWeek.includes(window.day_of_week)) {
                                includeHowl = true;
                            }
                        });
                        return includeHowl;
                    } else {
                        return daysOfWeek.includes(moment(howl.date).format("dddd"));
                    }
                });
            }
            if (daysOfWeek.length !== 0 && recurringMeetingWindows.length !== 0) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'once') {
                        let includeHowl = false;
                        const day = moment(howl.date).format("dddd");
                        if (daysOfWeek.includes(day)) {
                            if (!recurringMeetingWindows.find(win => win[Object.keys(win)[0]].dayOfWeek === day)) {
                                includeHowl = true;
                            }
                            howl.time_windows.forEach(window => {
                                recurringMeetingWindows.forEach(win => {
                                    const windowP = win[Object.keys(win)[0]];
                                    if (windowP.dayOfWeek === day) {
                                        if ((window.end_time > windowP.startTime && window.start_time <= windowP.startTime) || 
                                            (window.start_time < windowP.endTime && window.end_time >= windowP.endTime) ||
                                            (window.start_time >= windowP.startTime && window.end_time <= windowP.endTime)) {
                                                includeHowl = true;
                                        }
                                    }
                                });    
                            });
                        }
                        return includeHowl;
                    } else {
                        let includeHowl = false;
                        howl.time_windows.forEach(window => {
                            if (daysOfWeek.includes(window.day_of_week)) {
                                let found = false;
                                recurringMeetingWindows.forEach(win => {
                                    if (win[Object.keys(win)[0]].dayOfWeek === window.day_of_week) {
                                        found = true;
                                    }
                                });
                                if (found) {
                                    recurringMeetingWindows.forEach(win => {
                                        const windowP = win[Object.keys(win)[0]];
                                        if (windowP.dayOfWeek === window.day_of_week) {
                                            if ((window.end_time > windowP.startTime && window.start_time <= windowP.startTime) || 
                                                (window.start_time < windowP.endTime && window.end_time >= windowP.endTime) ||
                                                (window.start_time >= windowP.startTime && window.end_time <= windowP.endTime)) {
                                                    includeHowl = true;
                                            }
                                        }
                                    });    
                                } else {
                                    includeHowl = true;
                                }
                            }
                        });
                        return includeHowl;
                    }
                });
            }
            if (date) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'once') {
                        return howl.date === date;
                    } else {
                        let includeHowl = false;
                        howl.time_windows.forEach(window => {
                            if (moment(date).format("dddd") === window.day_of_week) {
                                includeHowl = true;
                            }
                        });
                        return includeHowl;
                    }
                });
            }
            if (date && timeWindows.length !== 0) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'once') {
                        let includeHowl = false;
                        if (howl.date === date) {
                            howl.time_windows.forEach(window => {
                                timeWindows.forEach(windowP => {
                                    if ((window.end_time > windowP.startTime && window.start_time <= windowP.startTime) || 
                                        (window.start_time < windowP.endTime && window.end_time >= windowP.endTime) ||
                                        (window.start_time >= windowP.startTime && window.end_time <= windowP.endTime)) {
                                            includeHowl = true;
                                        }
                                });    
                            });
                        }
                        return includeHowl;
                    } else {
                        let includeHowl = false;
                        howl.time_windows.forEach(window => {
                            if (moment(date).format("dddd") === window.day_of_week) {
                                timeWindows.forEach(windowP => {
                                    if ((window.end_time > windowP.startTime && window.start_time <= windowP.startTime) || 
                                        (window.start_time < windowP.endTime && window.end_time >= windowP.endTime) ||
                                        (window.start_time >= windowP.startTime && window.end_time <= windowP.endTime)) {
                                            includeHowl = true;
                                        }
                                });    
                            }
                        });
                        return includeHowl;
                    }
                });
            }
            res(filteredHowls);
        })
    },
    calculateAverageWithArrayOfReviews(reviews) {
        return reviews.reduce((acc, curr) => {
            const { 
                friendliness_dogs,
                friendliness_people,
                playing_interest,
                obedience,
                profile_accuracy,
                location_suitability,
            } = curr;
            const averageRating = (
                friendliness_dogs +
                friendliness_people +
                playing_interest +
                obedience +
                profile_accuracy + 
                location_suitability 
            ) / 6;
            return acc + averageRating;
        }, 0) / reviews.length;
    },
    serializeHowl(howl) {
        const {
            id,
            user_id,
            howl_title,
            date,
            meeting_type,
            personal_message,
            dogs,
            location,
            time_windows,
        } = howl;

        return {
            id,
            user_id,
            howl_title: xss(howl_title),
            date: xss(date),
            meeting_type: xss(meeting_type),
            personal_message: xss(personal_message),
            dogs: !dogs ? [] : dogs.map(dog => {
                return {
                    dog_id: dog.dog_id,
                    profile: {
                        name: xss(dog.profile.name), 
                        profile_img_url: xss(dog.profile.profile_img_url),
                        age_years: dog.profile.age_years,
                        age_months: dog.profile.age_months,
                        sex: xss(dog.profile.sex), 
                        breed: xss(dog.profile.breed),
                        weight: dog.profile.weight,
                        energy: xss(dog.profile.energy),
                        temperment: xss(dog.profile.temperment),
                        obedience: xss(dog.profile.obedience),
                        dislikes_puppies: dog.profile.dislikes_puppies,
                        dislikes_men: dog.profile.dislikes_men,
                        dislikes_women: dog.profile.dislikes_women,
                        dislikes_children: dog.profile.dislikes_children,
                        recently_adopted: dog.profile.recently_adopted,
                        prefers_people: dog.profile.prefers_people,
                        leash_aggression: dog.profile.leash_aggression,
                        elderly_dog: dog.profile.elderly_dog,
                        little_time_with_other_dogs: dog.profile.little_time_with_other_dogs,
                        much_experience_with_other_dogs: dog.profile.much_experience_with_other_dogs,
                        aggressive: dog.profile.aggressive,
                        owner_description: xss(dog.profile.owner_description),
                    },
                    owner: {
                        id: dog.owner.id,
                        email: xss(dog.owner.email),
                        username: xss(dog.owner.username),
                        phone: xss(dog.owner.phone),
                    }
                };
            }),
            location: {
                address: xss(location.address),
                city: xss(location.city),
                state: xss(location.state),
                zipcode: xss(location.zipcode),
                lat: xss(location.lat),
                lon: xss(location.lon),
            },
            time_windows: time_windows.map(window => {
                return {
                    day_of_week: xss(window.day_of_week),
                    start_time: xss(window.start_time),
                    end_time: xss(window.end_time),
                };
            }),
        };
    }
};

module.exports = HowlsService;