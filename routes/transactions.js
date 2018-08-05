'use strict';

const express = require('express');
const router = express.Router();

const {Transaction, Category} = require('../models');


router.post('/category/:categoryId', (req, res) => {

    const requiredFields = ['transaction', 'date', 'amount'];

    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);

            return res.status(400).send(message);
        }
    });

    return Category.findOne({
        where: {
            id: req.params.categoryId,
            user_id: req.user.id
        }
    })
    .then(category => {
        if (category) {
            return Transaction.create({
                transaction: req.body.transaction,
                date: req.body.date,
                amount: req.body.amount,
                category_id: req.params.categoryId
            })
        } 
    })
    .then(transaction => res.status(201).json(transaction.apiRepr()))
    .catch(err => res.status(500).send({message: 'Internal server error'}));
});

router.put('/:id/category/:categoryId', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);

        return res.status(400).json({message});
    }

    const toUpdate = {};
    const updateableFields = ['transaction', 'date', 'amount'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field]
        }
    });

    return Category.findOne({
        where: {
            id: req.params.categoryId,
            user_id: req.user.id
        }
    })
    .then(category => {
        if (category) {
            console.log(category);
            return Transaction.update(toUpdate, {
                where: {
                    id: req.params.id,
                    category_id: req.params.categoryId
                }
            });
        }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id/category/:categoryId', (req, res) => {
    return Category.findOne({
        where: {
            id: req.params.categoryId,
            user_id: req.user.id
        }
    })
    .then(category => {
        if (category) {
            return Transaction.destroy({
                where: {
                    id: req.params.id,
                    category_id: req.params.categoryId
                }
            });
        }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;