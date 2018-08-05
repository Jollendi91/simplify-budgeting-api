'use strict';

const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');

const {Category, Transaction} = require('../models');

router.get('/', (req, res) => {

    const Op = Sequelize.Op;

    const date = new Date(req.query.year, req.query.month);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return Category.findAll({
        where: {
            user_id: req.user.id
        },
        include: [{
            model: Transaction,
            as: 'transactions',
            where: {
                date: {
                    [Op.gt]: firstDay,
                    [Op.lt]: lastDay
                }
            },
            required: false
        }]
    })
    .then(categories => res.json({
        categories: categories.map(category => {
            const transactions = category.transactions.map(transaction => transaction.apiRepr());
          return category.apiRepr(transactions)
        })
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
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
    return Category.destroy({
        where: {
            id: req.params.id,
            user_id: req.user.id
        }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;