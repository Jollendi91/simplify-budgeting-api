'use strict';

const express = require('express');
const router = express.Router();
const {Category} = require('../models');

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
    .catch(() => res.status(500).send({message: 'Internal server error'}));
});

router.put('/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);

        return res.status(400).json({message});
    }

    const toUpdate = {};
    const updateableFields = ['category', 'amount'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    return Category.update(toUpdate, {
        where: {
            id: req.params.id,
            user_id: req.user.id
        }
    })
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
    return Category.destroy({
        where: {
            id: req.params.id,
            user_id: req.user.id
        }
    })
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;