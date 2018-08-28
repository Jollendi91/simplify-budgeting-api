const express = require('express');
const router = express.Router();

const {User} = require('../models');

router.post('/', (req, res, next) => {

    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        const err = new Error(`Missing '${missingField}' in request body`);
        err.status = 422;
        return next(err);
    }

    const stringFields = ["username", "password", "firstName", "lastName"];
    const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== "string");

    if (nonStringField) {
        const err = new Error(`Field: '${nonStringField}' must be type string`);
        err.status = 422;
        return next(err);
    }

    const explicitlyTrimmedFields = ["username", "password"];
    const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if (nonTrimmedField) {
        const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
        err.status = 422;
        return next(err);
    }

    const sizedFields = {
        username: {min: 1},
        password: {min: 8, max: 72}
    };

    const tooSmallField = Object.keys(sizedFields).find(field => "min" in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min);

    if (tooSmallField) {
        const min = sizedFields[tooSmallField].min;
        const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
        err.status = 422;
        return next(err);
    }

    const tooLargeField = Object.keys(sizedFields).find(field => "max" in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max);

    if (tooLargeField) {
        const max = sizedFields[tooLargeField].max;
        const err = new Error(`Field: '${tooLargeField}' must be at most ${max} characters long`);
        err.status = 422;
        return next(err);
    }

    const {username, password, firstName, lastName, monthlySalary} = req.body;

    return User.count({
        where: {
            username: username
        }
    })
    .then(count => {
        if (count > 0) {
            // If there is an existing user with the same username
            return Promise.reject({
            code: 422,
            reason: 'ValidationError',
            message: 'Username already taken',
            location: 'username'
            });
        }
        return User.hashPassword(password);
    })
    .then(hash => {
        const newUser = {
            firstName,
            lastName,
            username,
            password: hash,
            monthlySalary
        };

        return User.create(newUser)
    })
    .then(user => res.status(201).json(user.apiRepr()))
    .catch(err => {
        return res.status(500).send(err);
    });
});



module.exports = router;