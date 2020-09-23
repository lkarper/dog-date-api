# Dog Date API

This API was designed for use with the application [Dog Date](https://dog-date-app.herokuapp.com/) ([GitHub](https://github.com/lkarper/dog-date-app)).  It functions independently of the app, however, and resides at the base url `https://dog-date-api.herokuapp.com/api`, which is used for all API requests.

## Authorization (/auth)
Requests to endpoints that require authorization must include an `Authorization` header with a bearer token (e.g. `"Authorization": "bearer [token]"`).  Bearer tokens are obtained by appending a valid username and password to the body of a POST request sent to the `/auth/login` endpoint.  Tokens expire after fifteen minutes.  Tokens may be refreshed before expiry by making a POST request to `/auth/refresh` with an `Authorization` header that contains a valid bearer token. 

## Endpoints

### Users (/users)

#### /users/ (POST)
Make a POST request to this endpoint to create a new user. You must supply the following fields in the body of the request:
* password (string) - Passwords must: be between 8 and 72 characters in length, not begin or end with a space, contain at least one lowercase letter, contain at least one uppercase letter, contain at least one number, contain at least one special character (e.g. !, @, #, $, etc.).
* username (string) - Usernames must be between 3 and 72 characters in length.
* email (string)

Usernames and emails must be unique.  If a username or email is already linked to a user-account, the server will respond with 400.

The request body may contain the following optional fields:
* phone (string)

#### /users/ (PATCH) (authorization required)
This endoint is used to update a user's email or phone number.  Request bodies must contain one of:
* email (string)
* phone (string)

Emails must be unique.  If an email is already linked to a user-account, the server will respond with 400.

### Dog Profiles (/dog-profiles)

#### / (GET)
A GET request to this endpoint will return all dog profiles.

#### / (POST) (authorization required)
A POST request to this endpoint will create a new dog profile linked to the user whose information is contained within the bearer token appended to the `Authorization` header of the request.  The request body must contain the following fields:
* name (string) - A dog's name
* age_years (number) - A dog's age in years
* age_months (number) - A dog's age in months
* sex (string) - A dog's sex 
* breed (string) - A dog's breed
* weight (number) - A dog's weight
* energy (string) - A dog's energy level
* temperment (string) - A dog's temperment
* obedience (stirng) - A dog's obedience level
* dislikes_puppies (boolean) - A boolean value describing whether a dog dislikes puppies
* dislikes_men (boolean) - A boolean value describing whether a dog dislikes men
* dislikes_women (boolean) - A boolean value describing whether a dog dislikes women
* dislikes_children (boolean) - A boolean value describing whether a dog dislikes children
* recently_adopted (boolean) - A boolean value describing whether a dog has been recently adopted
* prefers_people (boolean) - A boolean value describing whether a dog prefers people to dogs
* leash_aggression (boolean) - A boolean value describing whether a dog has leash aggression
* elderly_dog (boolean) - A boolean value describing whether a dog is elderly
* little_time_with_other_dogs (boolean) - A boolean value describing whether a dog has spent little time with other dogs
* much_experience_with_other_dogs (boolean) - A boolean value describing whether a dog has spent much time with other dogs
* aggressive (boolean) - A boolean value describing whether a dog is aggressive
* owner_description (string) - A description of a dog

The following fields are optional:
* profile_img (base-64 data URI) - An image to be used in the dog's profile

#### /:dog_id (GET) (authorization required)
A GET request sent to this endpoint will return the dog profile information for the profile with the id equal to the `dog_id` parameter.

#### /:dog_id (DELETE) (authorization required)
A DELETE request sent to this endpoint will delete the dog profile with the id equal to the `dog_id` parameter.

#### /:dog_id (PATCH) (authorization required)
A PATCH request sent to this endpoint will update the dog profile with the id equal to the `dog_id` parameter.  The request body must contain at least one of the following fields:
* name (string) - A dog's name
* profile_img (base-64 data URI) - An image to be used in the dog's profile
* age_years (number) - A dog's age in years
* age_months (number) - A dog's age in months
* sex (string) - A dog's sex 
* breed (string) - A dog's breed
* weight (number) - A dog's weight
* energy (string) - A dog's energy level
* temperment (string) - A dog's temperment
* obedience (stirng) - A dog's obedience level
* dislikes_puppies (boolean) - A boolean value describing whether a dog dislikes puppies
* dislikes_men (boolean) - A boolean value describing whether a dog dislikes men
* dislikes_women (boolean) - A boolean value describing whether a dog dislikes women
* dislikes_children (boolean) - A boolean value describing whether a dog dislikes children
* recently_adopted (boolean) - A boolean value describing whether a dog has been recently adopted
* prefers_people (boolean) - A boolean value describing whether a dog prefers people to dogs
* leash_aggression (boolean) - A boolean value describing whether a dog has leash aggression
* elderly_dog (boolean) - A boolean value describing whether a dog is elderly
* little_time_with_other_dogs (boolean) - A boolean value describing whether a dog has spent little time with other dogs
* much_experience_with_other_dogs (boolean) - A boolean value describing whether a dog has spent much time with other dogs
* aggressive (boolean) - A boolean value describing whether a dog is aggressive
* owner_description (string) - A description of a dog

#### /pack-members (GET) (authorization required)
This endpoint returns the pack members for the user whose information is contained in the bearer token appended to the `Authorization` header.

#### /pack-members (POST) (authorization required)
This endpoint creates a new pack member.  You must supply the following fields in the body of the request:
* pack_member_id (number) - this is the ID for the dog profile that a user wishes to add to his/her pack.

#### /pack-members/:entry_id (GET) (authorization required)
A GET request sent to this endpoint will return the pack member information with the id equal to the `entry_id` parameter.

#### /pack-member/:entry_id (DELETE) (authorization required)
A DELETE request sent to this endpoint will delete the pack member with the entry id equal to the `entry_id` parameter.

#### /user-dogs (GET) (authorization required)
A GET request sent to this endpoint will return the dog profile information for all dogs linked to the user whose info is contained within the bearer token appended to the request's `Authorization` header.

### Howls (/howls)

#### / (GET) 
A GET request sent to this endpoint without query parameters will return information for all howls.  Howls may be filtered using the following query parameters: 
* state - A US postal code state abbreviation (e.g. NY, AL, PA).  Only one state may be queried per request.
* zipcode - A five digit US ZIP code.
* rating_filter - A minimum average rating that a dog in a howl must meet for the dog to be included in the howl (1 - 5).
* type_of_meeting - The type of howl desired.  For one time meetings, use `once`; for recurring meetings, use `recurring`.
* days_of_the_weeks - The days of the week on which a howl may fall; first letter capitalized.  Separate each day with a `|` (no spaces, e.g. `Monday|Friday|Saturday`).
* recurring_meeting_windows - Used to add time windows for days of the week that have been included. A day may be added to days_of_the_week without time windows (in which case all meetings that fall on that day will be returned).  Time should be in 24-hour format.  Separate each time window with a `|`.  Time windows take the following form: `[Day-index], [Day], [start time], [end time]`. E.g. `Monday-0,Monday,10:00,14:00|Tuesday-0,Tuesday,14:00,18:00`.
* date - A calendar date on which a howl must fall.  Dates must match the following format: `[four-digit year]-[two-digit month]-[two-digit day]`. Only one date may be used per request. E.g. `2020-09-04`. 
* time_windows - Used to add time windows for a calendar date that has been included. If no time windows are included, all meetings that fall on that day will be returned.  Time should be in 24-hour format.  Separate each time window with a `|`.  Time windows take the following form: `[start time],[end time]`.  E.g. `12:00,15:00|17:00,18:00|20:00,22:00`.

#### / (POST) (authorization required)
This endpoint is used to create a new howl linked to the user whose information is contained within the bearer token appended to the `Authorization` header of the request.  The request body must contain the following fields:
* howl_title (string) - A title for the howl.
* address (string) - The address or location at which the howl will take place.
* city (string) - The city in which the howl will take place.
* state (string) - The US postal code state abbreviation for the state in which the howl will take place (e.g. NY, AL, PA). 
* zipcode (string) - The five digit US ZIP code where the howl will take place.
* date (string) - The date on which a howl will occur.  Dates must match the following format: `[four-digit year]-[two-digit month]-[two-digit day]` (e.g. `2020-09-04`). 
* meeting_type (string) - Whether the howl is a one-time howl (`once`) or a recurring howl (`recurring`).
* personal_message (string) - A personal message to be included with the howl.
* dog_ids (array of numbers) - An array of id numbers for dogs that are to be included in the howl.
* time_windows (array of objects) - An array of time windows during which the user would like to meet.  Each object must contain the following fields:
* day_of_week (string) - If the howl is a recurring howl, include the day of week on which the time window falls, first letter capitalized. If the howl is a one-time howl, use an empty string.
* start_time(string) - The time at which the window begins (24-hour format).
* end_time(string) - The time at which the window ends (24-hour format).
E.g.
    `[
        {
            "day_of_week": "Monday",
            "start_time": "10:00",
            "end_time": "14:00",
        },
        {
            "day_of_week": "Tuesday",
            "start_time": "14:00",
            "end_time": "16:00",
        },
    ]`

A request body may contain the following optional fields:
* lat (string) - The geographic latitude for the howl's location.
* lon (string) - The geographic longitude for the howl's location.

#### /:howl_id (GET) (authorization required)
A GET request sent to this endpoint returns information for the howl with the id equal to the parameter `howl_id`.

#### /:howl_id (PATCH) (authorization required)
A PATCH request sent to this endpoint updates the details of a howl with the id equal to the parameter `howl_id`.  The request body must contain at least one of the following fields:
* howl_title (string) - A title for the howl.
* address (string) - The address or location at which the howl will take place.
* city (string) - The city in which the howl will take place.
* state (string) - The US postal code state abbreviation for the state in which the howl will take place (e.g. NY, AL, PA). 
* zipcode (string) - The five digit US ZIP code where the howl will take place.
* lat (string) - The geographic latitude for the howl's location.
* lon (string) - The geographic longitude for the howl's location.
* date (string) - The date on which a howl will occur.  Dates must match the following format: `[four-digit year]-[two-digit month]-[two-digit day]` (e.g. `2020-09-04`). 
* meeting_type (string) - Whether the howl is a one-time howl (`once`) or a recurring howl (`recurring`).
* personal_message (string) - A personal message to be included with the howl.
* dog_ids (array of numbers) - An array of id numbers for dogs that are to be included in the howl.
* time_windows (array of objects) - An array of time windows during which the user would like to meet.  Each object must contain the following fields:
* day_of_week (string) - If the howl is a recurring howl, include the day of week on which the time window falls, first letter capitalized. If the howl is a one-time howl, use an empty string.
* start_time(string) - The time at which the window begins (24-hour format).
* end_time(string) - The time at which the window ends (24-hour format).
E.g.
    `[
        {
            "day_of_week": "Monday",
            "start_time": "10:00",
            "end_time": "14:00",
        },
        {
            "day_of_week": "Tuesday",
            "start_time": "14:00",
            "end_time": "16:00",
        },
    ]`

#### /:howl_id (DELETE) (authorization required)
A DELETE request sent to this endpoint deletes the howl with the id equal to the parameter `howl_id`

#### /by-dog/:dog_id (GET) (authorization required)
A GET request sent to this endpoint returns all howls which include a dog with the id equal to the parameter `dog_id`.

#### /user-saved (GET) (authorization required)
A GET request sent to this endpoint returns the saved howls for the user whose information is contained in the bearer token appended to the `Authorization` header.

#### /user-saved (POST) (authorization required)
This endpoint is used to add a howl to a user's saved howls. You must supply the following fields in the request body:
* howl_id (number) - The id for the howl that is to be saved

#### /user-saved/:entry_id (GET) ) (authorization required)
A GET request sent to this endpoint will return the howl information for the howl in a user's saved howls with the id equal to the parameter `entry_id`.

#### /user-saved/:entry_id (DELETE) (authorization required)
A DELETE request sent to this endpoint removes the howl with the id equal to the parameter `entry_id` from the list of a user's saved howls. 

#### /by-user (GET) (authorization required)
A GET request sent to this endpoint returns the howl created by the user whose information is contained in the bearer token appended to the `Authorization` header.

### Reviews (/reviews)

#### / (GET)
A GET request sent to this endpoint returns all dog reviews.

#### / (POST) (authorization required)
A POST request sent to this endpoint is used to create a new dog review.  The request body must contain the following fields:
* date_created (string) - The date and time at which the review was created (in JSON string format; e.g. '2020-07-31T19:35:31.457Z').
* dog_id (number) - The id of the dog being reviewed.
* review_title (string) - A title for the review.
* friendliness_dogs (number) - A score (1 - 5) reflecting how friendly a dog is towards other dogs.
* friendliness_people (number) - A score (1 - 5) reflecting how friendly a dog is towards people.
* playing_interest (number) - A score (1 - 5) reflecting how interested a dog is in playing.
* obedience (number) - A score (1 - 5) reflecting how obedient a dog is.
* profile_accuracy (number) - A score (1 - 5) reflecting how accurate a dog's profile is.
* location_suitability (number) - A score (1 - 5) reflecting how suitable the location of a playdate is.
* address (string) - The address or location at which the user's dog played with the dog being reviewed.
* city (string) - The city in which the user's dog played with the dog being reviewed.
* state (string) - The US postal code state abbreviation for the state in which the user's dog played with the dog being reviewed. (e.g. NY, AL, PA). 
* zipcode (string) - The five digit US ZIP code where the user's dog played with the dog being reviewed.
* date (string) - The date on which the user's dog played with the dog being reviewed.  Dates must match the following format: `[four-digit year]-[two-digit month]-[two-digit day]` (e.g. `2020-09-04`). 
* start_time (string) - The time at which a playdate started (24-hr format; e.g. 18:00).
* end__time (string) - The time at which a playdate ended (24-hr format; e.g. 18:00).

A request body may contain the following optional fields:
* lat (string) - The geographic latitude for the location where the user's dog played with the dog being reviewed.
* lon (string) - The geographic longitude for the location where the user's dog played with the dog being reviewed.
* personal_message (string) - A personal message to be included with the review.

#### /:review_id (GET) (authorization required)
A GET request sent to this endpoint will return the review with the id equal to the parameter `review_id`.

#### /:review_id (DELETE) (authorization required)
A DELETE request sent to this endpoint will DELETE the review with the id equal to the parameter `review_id`.

#### /:review_id (PATCH) (authorization required)
This endpoint is used to update reviews.  The request body must contain one of:
* date_created (string) - The date on which the date was created (in JSON string format; e.g. '2020-07-31T19:35:31.457Z').
* dog_id (number) - The id of the dog being reviewed.
* review_title (string) - A title for the review.
* friendliness_dogs (number) - A score (1 - 5) reflecting how friendly a dog is towards other dogs.
* friendliness_people (number) - A score (1 - 5) reflecting how friendly a dog is towards people.
* playing_interest (number) - A score (1 - 5) reflecting how interested a dog is in playing.
* obedience (number) - A score (1 - 5) reflecting how obedient a dog is.
* profile_accuracy (number) - A score (1 - 5) reflecting how accurate a dog's profile is.
* location_suitability (number) - A score (1 - 5) reflecting how suitable the location of a playdate is.
* address (string) - The address or location at which the user's dog played with the dog being reviewed.
* city (string) - The city in which the user's dog played with the dog being reviewed.
* state (string) - The US postal code state abbreviation for the state in which the user's dog played with the dog being reviewed. (e.g. NY, AL, PA). 
* zipcode (string) - The five digit US ZIP code where the user's dog played with the dog being reviewed.
* date (string) - The date on which the user's dog played with the dog being reviewed.  Dates must match the following format: `[four-digit year]-[two-digit month]-[two-digit day]` (e.g. `2020-09-04`). 
* start_time (string) - The time at which a playdate started (24-hr format; e.g. 18:00).
* end__time (string) - The time at which a playdate ended (24-hr format; e.g. 18:00).
* lat (string) - The geographic latitude for the location where the user's dog played with the dog being reviewed.
* lon (string) - The geographic longitude for the location where the user's dog played with the dog being reviewed.
* personal_message (string) - A personal message to be included with the review.

#### /by-owner (GET) (authorization required)
A GET request sent to this endpoint will return all reviews of dog's owned by the user whose information is contained in the bearer token appended to the `Authorization` header.

#### /by-dog/:dog_id (GET) (authorization required)
A GET request sent to this endpoint will return all reviews of a dog whose id is equal to the parameter `dog_id`.

#### /:review_id/comments (GET) (authorization required)
A GET request sent to this endpoint will return all comments on a review with the id equal to the parameter `review_id`.

#### /:review_id/comments (POST) (authorization required)
This endpoint is used to add a new comment to a review.  The request body must contain the following fields:
* date_time (string) -The date and time at which the comment was created (in JSON string format; e.g. '2020-07-31T19:35:31.457Z').
* comment (string) - The comment text.
* edited (boolean) - A boolean value indicating whether the comment has been edited.

#### /:review_id/comment/:comment_id (GET) (authorization required)
A GET request sent to this endpoint will return the comment with the id equal to the parameter `comment_id`.

#### /:review_id/comment/:comment_id (DELETE) (authorization required)
A DELETE request sent to this endpoint will delete the comment with the id equal to the parameter `comment_id`.

#### /:review_id/comment/:comment_id (PATCH) ) (authorization required)
A PATCH request send to this endpoint will update a comment.  The request body must contain at least one of the following fields: 
* date_time (string) -The date and time at which the comment was created (in JSON string format; e.g. '2020-07-31T19:35:31.457Z').
* comment (string) - The comment text.
* edited (boolean) - A boolean value indicating whether the comment has been edited.
