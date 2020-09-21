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
                    `json_build_object(
                        'username', usr.username,
                        'email', usr.email,
                        'phone', usr.phone
                    ) AS "user_info"`
                ),
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
                                from dog_date_dog_profiles AS dp
                                where dp.id=dih.dog_id
                            )
                            from dog_date_dogs_in_howls AS dih
                            where dih.howl_id=ddh.id
                        ) h
                    ) AS dogs`
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
                    ) AS time_windows`
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
            user_id,
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
            user_id,
        };

        /* 
            Save the howl id for use in each step of the transaction below 
            and to return howl data after the transaction
        */
        let howlId;

        // The complete data for a howl is saved over multiple tables, so a transaction is used to ensure integrity of data
        return db.transaction(function(trx) {
            return trx
                .insert(baseHowl, 'id')
                .into('dog_date_howls')
                .then(ids => {
                    howlId = ids[0];
                    const dogs = dog_ids
                        .map(dog_id => {
                            return {
                                howl_id: howlId,
                                dog_id,
                            };
                        });
                    return trx('dog_date_dogs_in_howls').insert(dogs);
                })
                .then(() => {
                    const windows = time_windows
                        .map(window => {
                            return {
                                howl_id: howlId,
                                ...window,
                            };
                        });
                    return trx('dog_date_time_windows').insert(windows);
                });
        })
            .then(inserts => this.getById(db, howlId))
            .catch(error => console.error(error));
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
            user_id,
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
            user_id,
        };

        // The complete data for a howl is saved over multiple tables, so a transaction is used to ensure integrity of data
        return db.transaction(function(trx) {
            return trx('dog_date_howls')
                .where({ id })
                .update(baseHowl)
                .then(() => {
                    /*
                        Only update dog_date_dogs_in_howls if necessary;
                        First deletes all of the old entries; this prevents accidental duplication of data
                    */
                    if (dog_ids) {
                        return trx('dog_date_dogs_in_howls')
                            .where('howl_id', id)
                            .delete();
                    }
                    return;
                })
                .then(() => {
                    // Adds dogs back into dog_date_dogs_in_howls, if they were deleted in the last step
                    if (dog_ids) {
                        const dogs = dog_ids
                            .map(dog_id => {
                                return {
                                    howl_id: id,
                                    dog_id,
                                };
                            });
                        return trx('dog_date_dogs_in_howls').insert(dogs);
                    }
                    return;
                })
                .then(() => {
                     /*
                        Only update dog_date_time_windows if necessary;
                        First deletes all of the old entries; this prevents accidental duplication of data
                    */
                    if (time_windows) {
                        return trx('dog_date_time_windows')
                            .where('howl_id', id)
                            .delete();
                    }
                    return;
                })
                .then(() => {
                    // Adds time windows back into dog_date_time_windows, if they were deleted in the last step
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
        // Filters howls by query params
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
                time_windows = '',
            } = params;

            const daysOfWeek = days_of_week ? days_of_week.split('|') : [];

            // recurringMeetingWindows stores time windows for a meeting on a day of the week (e.g. Fridays)
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
                                },
                            };
                        }) 
                : 
                    [];

            // timeWindows stores time windows for a meeting on a specific date (e.g. June 30, 2020)
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
                // First, find all of the ids of dogs that have an average rating equal to or greater than the query param
                const arrayOfPassingDogIds = filteredHowls
                    .filter(howl => howl.dogs && howl.dogs.length !== 0)
                    .map(howl => howl.dogs.map(dog => dog.dog_id))
                    .flat()
                    .map(dog_id => reviews.filter(review => review.dog_id === dog_id))
                    .filter(arrayOfReviews => 
                        this.calculateAverageWithArrayOfReviews(arrayOfReviews) >= parseInt(rating_filter)
                    )
                    .map(arrayOfReviews => arrayOfReviews[0].dog_id);

                // Next, filter the howls by those dog ids that meet the requirement
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

            // Filters howls by day of the week (e.g. Fridays, Saturdays)    
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
                        /* 
                            If a howl is a one time howl that falls on a calendar date (e.g. June 30), 
                            find out which day of the week that date falls on (e.g. Tuesday) 
                            and use that to determine if the howl passes the filter
                        */
                        return daysOfWeek.includes(
                            moment(howl.date)
                                .format("dddd")
                        );
                    }
                });
            }

            // Filters howls by time windows on days of the week (e.g. Fridays, 8:00 - 14:00)
            if (daysOfWeek.length !== 0 && recurringMeetingWindows.length !== 0) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'once') {
                        /* 
                            If a howl is a one time howl that falls on a calendar date (e.g. June 30), 
                            find out which day of the week that date falls on (e.g. Tuesday) 
                            and use that to determine if the howl passes the filter
                        */
                        let includeHowl = false;
                        const day = moment(howl.date).format("dddd");
                        
                        /* 
                            If the howl occurs on the requested day of the week, 
                            determine if it falls within the queried time windows 
                            for that day (if there are any)
                        */
                        if (daysOfWeek.includes(day)) {
                            /*
                                First, determine if the day of the week includes time windows.
                                (E.g. A query may seek all howls on Fridays (regardless of time), 
                                but only howls that fall within the window 8:00 - 12:00 on Saturdays.
                                In this case, there is no need to check if a howl that occurs on a 
                                Friday falls within a certain period of time.)
                            */
                            if (!recurringMeetingWindows.find(win => win[Object.keys(win)[0]].dayOfWeek === day)) {
                                includeHowl = true;
                            }

                            /* 
                                Next, if a day of the week does include time windows, determine whether
                                the howl falls within any of the queried time windows for that day.
                                Code below loops through the queried time windows and the time windows
                                for each howl and determines if they overlap
                            */
                            howl.time_windows.forEach(window => {
                                recurringMeetingWindows.forEach(win => {
                                    // windowQ stands for the queried window
                                    const windowQ = win[Object.keys(win)[0]];
                                    if (windowQ.dayOfWeek === day) {
                                        if ((window.end_time > windowQ.startTime && window.start_time <= windowQ.startTime) || 
                                            (window.start_time < windowQ.endTime && window.end_time >= windowQ.endTime) ||
                                            (window.start_time >= windowQ.startTime && window.end_time <= windowQ.endTime)) {
                                                includeHowl = true;
                                        }
                                    }
                                });    
                            });
                        }
                        return includeHowl;
                    } else {
                        // If a howl is a recurring howl
                        let includeHowl = false;
                        howl.time_windows.forEach(window => {
                            // First determine if the howl falls on any days of the week that were queried
                            if (daysOfWeek.includes(window.day_of_week)) {
                                let found = false;
                                /* 
                                    Next, determine if the day of the week includes time windows.
                                    (E.g. A query may seek all howls on Fridays (regardless of time), 
                                    but only howls that fall in the window 8:00 - 12:00 on Saturdays.
                                    In this case, there is no need to check if a howl that occurs on a 
                                    Friday falls within a certain period of time.)
                                */
                                recurringMeetingWindows.forEach(win => {
                                    if (win[Object.keys(win)[0]].dayOfWeek === window.day_of_week) {
                                        found = true;
                                    }
                                });
                                /* 
                                    If a day of the week does include time windows, determine whether
                                    the howl falls within any of the queried time windows for that day.
                                    Code below loops through the queried time windows and the time windows
                                    for each howl and determines if they overlap
                                */
                                if (found) {
                                    recurringMeetingWindows.forEach(win => {
                                        // windowQ stands for the queried window
                                        const windowQ = win[Object.keys(win)[0]];
                                        if (windowQ.dayOfWeek === window.day_of_week) {
                                            if ((window.end_time > windowQ.startTime && window.start_time <= windowQ.startTime) || 
                                                (window.start_time < windowQ.endTime && window.end_time >= windowQ.endTime) ||
                                                (window.start_time >= windowQ.startTime && window.end_time <= windowQ.endTime)) {
                                                    includeHowl = true;
                                            }
                                        }
                                    });    
                                } else {
                                    /* 
                                        If a queried day of the week does not include time windows,
                                        and the howl falls on the day (regardless of time), include it
                                    */
                                    includeHowl = true;
                                }
                            }
                        });
                        return includeHowl;
                    }
                });
            }

            // Filters howls by calendar date (e.g. June 30)
            if (date) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'once') {
                        return howl.date === date;
                    } else {
                        /* 
                            If howl is recurring, determine the day of the week on which the queried date falls,
                            then determine if the howl falls on that day of the week
                        */
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

            // Filters howls by time windows on a specific date (e.g. June 30, 10:00 - 12:00)
            if (date && timeWindows.length !== 0) {
                filteredHowls = filteredHowls.filter(howl => {
                    if (howl.meeting_type === 'once') {
                        // If the howl is a one time howl, determine if the howl falls within the queried windows
                        let includeHowl = false;
                        if (howl.date === date) {
                            /* 
                                If the howl falls on the date, loop through the queried time windows 
                                and the time windows for each howl and determines if they overlap
                            */
                            howl.time_windows.forEach(window => {
                                timeWindows.forEach(windowQ => {
                                    // windowQ stands for queried window
                                    if ((window.end_time > windowQ.startTime && window.start_time <= windowQ.startTime) || 
                                        (window.start_time < windowQ.endTime && window.end_time >= windowQ.endTime) ||
                                        (window.start_time >= windowQ.startTime && window.end_time <= windowQ.endTime)) {
                                            includeHowl = true;
                                        }
                                });    
                            });
                        }
                        return includeHowl;
                    } else {
                        /* 
                            If the howl is a recurring howl, determine what day of the week the date falls on 
                            and determine if the howl falls on that day of the week 
                        */
                        let includeHowl = false;
                        howl.time_windows.forEach(window => {
                            if (moment(date).format("dddd") === window.day_of_week) {
                                 /* 
                                    If the howl falls on the date, loop through the queried time windows 
                                    and the time windows for each howl and determines if they overlap
                                */
                                timeWindows.forEach(windowQ => {
                                    if ((window.end_time > windowQ.startTime && window.start_time <= windowQ.startTime) || 
                                        (window.start_time < windowQ.endTime && window.end_time >= windowQ.endTime) ||
                                        (window.start_time >= windowQ.startTime && window.end_time <= windowQ.endTime)) {
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
        // Calculates a dog's average rating based on reviews
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
            user_info,
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
            user_info: {
                username: xss(user_info.username),
                email: xss(user_info.email),
                phone: xss(user_info.phone), 
            },
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
