'use strict';

const express = require('express');
const router = express.Router();

const {Category} = require('../models');

router.get('/', (req, res) => {

    return Category.findAll({
        where: {
            user_id: req.user.id
        }
    })
    .then(categories => res.json({
        categories: categories.map(category => category.apiRepr())
    }))
});

router.post('/', (req, res) => {
    const requiredFields = ['category', 'amount'];

    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];

        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);

            return res.status(400).send(message);
        }
    }

    return Category.create({
        category: req.body.category,
        amount: req.body.amount,
        user_id: req.user.id
    })
    .then(category => res.status(201).json(category.apiRepr()))
    .catch(err => res.status(500).send({message: 'Internal server error'}));
});

module.exports = router;