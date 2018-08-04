'use strict';

const express = require('express');
const router = express.Router();

const {User} = require('../models');

router.get('/', (req, res) => User.findById(req.user.id)
    .then(user => res.json(user.apiRepr()))
);

router.put('/', (req, res) => {
    if(!(req.user.id && req.body.id && req.user.id === req.body.id)) {
        const message = (`Request user id (${req.user.id}) and request body id (${req.body.id}) must match`);

        console.error(message);
        res.status(400).json({message});
    }

    const toUpdate = {};
    const updateableFields = ['setupStep', 'monthlySalary'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    return User.update(toUpdate, {
        where: {
            id: req.user.id
        }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;