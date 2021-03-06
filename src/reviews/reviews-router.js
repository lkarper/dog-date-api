const express = require('express');
const path = require('path');
const { requireAuth } = require('../middleware/jwt-auth');
const ReviewsService = require('./reviews-service');

const reviewsRouter = express.Router();
const jsonBodyParser = express.json();

reviewsRouter
    .route('/')
    .get((req, res, next) => {
        ReviewsService.getAllReviews(req.app.get('db'))
            .then(reviews => {
                res.json(reviews.map(ReviewsService.serializeReview));
            })
            .catch(next);
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const {
          date_created,
          dog_id,
          review_title,
          friendliness_dogs,
          friendliness_people,
          playing_interest,
          obedience,
          profile_accuracy,
          location_suitability,
          address,
          city,
          state,
          zipcode,
          lat,
          lon,
          date,
          start_time,
          end_time,
          personal_message,  
        } = req.body;

        const newReview = {
            date_created,
            dog_id,
            review_title,
            friendliness_dogs,
            friendliness_people,
            playing_interest,
            obedience,
            profile_accuracy,
            location_suitability,
            address,
            city,
            state,
            zipcode,
            date,
            start_time,
            end_time,
        };

        for (const [key, value] of Object.entries(newReview)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`,
                });
            }
        }

        newReview.reviewer = req.user.username;
        newReview.lat = lat;
        newReview.lon = lon;
        newReview.personal_message = personal_message;

        ReviewsService.insertReview(
            req.app.get('db'),
            newReview
        )
            .then(review => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${review.id}`))
                    .json(ReviewsService.serializeReview(review));
            })
            .catch(next);

    });

reviewsRouter
    .route('/by-owner')
    .all(requireAuth)
    .get((req, res, next) => {
        ReviewsService.getReviewsByOwner(
            req.app.get('db'),
            req.user.id
        )
            .then(reviews => {
                res.json(reviews.map(ReviewsService.serializeReview));
            })
            .catch(next);
    });

reviewsRouter
    .route('/by-dog/:dog_id')
    .all(requireAuth)
    .get((req, res, next) => {
        ReviewsService.getReviewsByDog(
            req.app.get('db'),
            req.params.dog_id
        )
            .then(reviews => {
                res.json(reviews.map(ReviewsService.serializeReview));
            })
            .catch(next);
    });

reviewsRouter
    .route('/:review_id')
    .all(checkReviewExists)
    .all(requireAuth)
    .get((req, res, next) => {
        res.json(ReviewsService.serializeReview(res.review));
    })
    .delete((req, res, next) => {
        // Verifies that the user attempting to delete the review created it
        if (res.review.reviewer !== req.user.username) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

        ReviewsService.deleteReview(
            req.app.get('db'),
            req.params.review_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonBodyParser, (req, res, next) => {
        // Verifies that the user attempting to patch the review created it
        if (res.review.reviewer !== req.user.username) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

        const {
            date_created,
            review_title,
            dog_id,
            friendliness_dogs,
            friendliness_people,
            playing_interest,
            obedience,
            profile_accuracy,
            location_suitability,
            address,
            city,
            state,
            zipcode,
            lat,
            lon,
            date,
            start_time,
            end_time,
            personal_message,  
        } = req.body;
  
        const reviewToUpdate = {
            date_created,
            review_title,
            dog_id,
            friendliness_dogs,
            friendliness_people,
            playing_interest,
            obedience,
            profile_accuracy,
            location_suitability,
            address,
            city,
            state,
            zipcode,
            lat,
            lon,
            date,
            start_time,
            end_time,
            personal_message,  
        };

        const numberOfValues = Object.values(reviewToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'date_created', 'review_title', 'dog_id', 'friendliness_dogs', 'friendliness_people', 'playing_interest', 'obedience', 'profile_accuracy', 'location_suitability', 'address', 'city', 'state', 'zipcode', 'lat', 'lon', 'date', 'start_time', 'end_time', 'personal_message'.`,
                }
            });
        }

        ReviewsService.updateReview(
            req.app.get('db'),
            req.params.review_id,
            reviewToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    });

reviewsRouter
    .route('/:review_id/comments')
    .all(checkReviewExists)
    .all(requireAuth)
    .get((req, res, next) => {
        ReviewsService.getCommentsForReview(
            req.app.get('db'),
            req.params.review_id
        )
            .then(comments => {
                res.json(comments.map(ReviewsService.serializeComment));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {
            date_time,
            comment,
            edited
        } = req.body;

        const newComment = {
            date_time,
            comment,
            edited
        };

        for (const [key, value] of Object.entries(newComment)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`,
                });
            }
        }

        newComment.review_id = req.params.review_id;
        newComment.commenter = req.user.username;

        ReviewsService.insertComment(
            req.app.get('db'),
            newComment
        )
            .then(comment => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${comment.id}`))
                    .json(ReviewsService.serializeComment(comment));
            })
            .catch(next);
    });

reviewsRouter
    .route('/:review_id/comments/:comment_id')
    .all(checkCommentExists)
    .all(requireAuth)
    .get((req, res, next) => {
        res.json(ReviewsService.serializeComment(res.comment));
    })
    .delete((req, res, next) => {
        // Verifies that the user attempting to delete the comment created it
        if (res.comment.commenter !== req.user.username) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

        ReviewsService.deleteComment(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonBodyParser, (req, res, next) => {
        // Verifies that the user attempting to patch the comment created it
        if (res.comment.commenter !== req.user.username) {
            return res.status(401).json({ error: `Unauthorized request` });
        }

        const {
            date_time,
            comment,
            edited,
        } = req.body;

        const commentToUpdate = {
            date_time,
            comment,
            edited,
        };

        const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of 'date_time', 'comment', 'edited'.`,
                },
            });
        }

        ReviewsService.updateComment(
            req.app.get('db'),
            req.params.comment_id,
            commentToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    });


async function checkCommentExists(req, res, next) {
    try {
        const comment = await ReviewsService.getCommentById(
            req.app.get('db'),
            req.params.comment_id
        );

        if (!comment) {
            return res.status(404).json({
                error: { message: `Comment doesn't exist` },
            });
        }

        res.comment = comment;
        next();
    } catch(error) {
        next(error);
    }
}

async function checkReviewExists(req, res, next) {
    try {
        const review = await ReviewsService.getReviewById(
            req.app.get('db'),
            req.params.review_id
        );

        if (!review) {
            return res.status(404).json({
                error: { message: `Review doesn't exist` },
            });
        }

        res.review = review;
        next();
    } catch(error) {
        next(error);
    }
}

module.exports = reviewsRouter;
