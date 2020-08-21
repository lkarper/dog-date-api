const xss = require('xss');

const ReviewsService = {
    getAllReviews(db) {
        return db
            .from('dog_date_reviews AS ddr')
            .select(
                'ddr.id',
                'ddr.date_created',
                'ddr.reviewer',
                'ddr.friendliness_dogs',
                'ddr.friendliness_people',
                'ddr.playing_interest',
                'ddr.obedience',
                'ddr.profile_accuracy',
                'ddr.personal_message',
                'ddr.date',
                'ddr.start_time',
                'ddr.end_time',
                'ddr.location_suitability',
                db.raw(
                    `json_strip_nulls(
                        json_build_object(
                            'address', ddr.address,
                            'city', ddr.city,
                            'state', ddr.state,
                            'zipcode', ddr.zipcode,
                            'lat', ddr.lat,
                            'lon', ddr.lon
                        )
                    ) as "location"`
                ),
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
                        'owner_description', dp.owner_description
                    ) AS "dog_profile"`
                ),
                db.raw(
                    `(
                        select array_to_json(
                            array_agg(row_to_json(h))
                        ) from (
                            select id, review_id, commenter, date_time, comment, edited
                            from dog_date_review_comments AS rc
                            where rc.review_id=ddr.id
                        ) h
                    ) as comments`
                )
            )
            .leftJoin('dog_date_dog_profiles AS dp', 'dp.id', 'ddr.dog_id');
    },
    getReviewById(db, id) {
        return this.getAllReviews(db)
            .where('ddr.id', id)
            .first();
    },
    getReviewsByDog(db, dog_id) {
        return this.getAllReviews(db)
            .where('ddr.dog_id', dog_id);
    },
    insertReview(db, newReview) {
        return db
            .insert(newReview)
            .into('dog_date_reviews')
            .returning('*')
            .then(([review]) => review)
            .then(review => this.getReviewById(db, review.id));
    },
    deleteReview(db, id) {
        return db('dog_date_reviews')
            .where({ id })
            .delete();
    },
    updateReview(db, id, newReviewFields) {
        return db('dog_date_reviews')
            .where({ id })
            .update(newReviewFields);
    },
    getCommentsForReview(db, review_id) {
        return db('dog_date_review_comments')
            .where({ review_id })
            .select('*')
            .orderBy('date_time');
    },
    insertComment(db, newComment) {
        return db
            .insert(newComment)
            .into('dog_date_review_comments')
            .returning('*')
            .then(([comment]) => comment);
    },
    getCommentById(db, id) {
        return db('dog_date_review_comments')
            .where({ id })
            .first();
    },
    deleteComment(db, id) {
        return db('dog_date_review_comments')
            .where({ id })
            .delete();
    },
    updateComment(db, id, newCommentFields) {
        return db('dog_date_review_comments')
            .where({ id })
            .update(newCommentFields);
    },
    serializeComment(comment) {
        const {
            id,
            review_id,
            commenter,
            date_time,
            edited,
        } = comment;

        return {
            id,
            review_id,
            commenter: xss(commenter),
            date_time,
            comment: xss(comment.comment),
            edited
        };
    },
    serializeReview(review) {
        const {
            id,
            date_created,
            reviewer,
            friendliness_dogs,
            friendliness_people,
            playing_interest,
            obedience,
            profile_accuracy,
            location_suitability,
            date,
            start_time,
            end_time,
            personal_message,
            location,
            dog_profile,
            comments,
        } = review;

        return {
            id,
            date_created,
            reviewer: xss(reviewer),
            friendliness_dogs,
            friendliness_people,
            playing_interest,
            obedience,
            profile_accuracy,
            location_suitability,
            date: xss(date),
            start_time: xss(start_time),
            end_time: xss(end_time),
            personal_message: xss(personal_message),
            location: {
                address: xss(location.address),
                city: xss(location.city),
                state: xss(location.state),
                zipcode: xss(location.zipcode),
                lat: xss(location.lat),
                lon: xss(location.lon),
            },
            dog_profile: {
                name: xss(dog_profile.name), 
                profile_img_url: xss(dog_profile.profile_img_url),
                age_years: dog_profile.age_years,
                age_months: dog_profile.age_months,
                sex: xss(dog_profile.sex), 
                breed: xss(dog_profile.breed),
                weight: dog_profile.weight,
                energy: xss(dog_profile.energy),
                temperment: xss(dog_profile.temperment),
                obedience: xss(dog_profile.obedience),
                dislikes_puppies: dog_profile.dislikes_puppies,
                dislikes_men: dog_profile.dislikes_men,
                dislikes_women: dog_profile.dislikes_women,
                dislikes_children: dog_profile.dislikes_children,
                recently_adopted: dog_profile.recently_adopted,
                prefers_people: dog_profile.prefers_people,
                leash_aggression: dog_profile.leash_aggression,
                elderly_dog: dog_profile.elderly_dog,
                little_time_with_other_dogs: dog_profile.little_time_with_other_dogs,
                much_experience_with_other_dogs: dog_profile.much_experience_with_other_dogs,
                aggressive: dog_profile.aggressive,
                owner_description: xss(dog_profile.owner_description),
            },
            comments: comments 
                ? 
                    comments.map(comment => {
                        return {
                            id: comment.id,
                            review_id: comment.review_id,
                            commenter: xss(comment.commenter),
                            date_time: xss(comment.date_time),
                            comment: xss(comment.comment),
                            edited: comment.edited,
                        };
                    }) 
                : 
                    [],
        };
    },
};

module.exports = ReviewsService;