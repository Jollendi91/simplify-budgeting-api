'use strict';
const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const {Transaction, Category} = require('../models');

router.get('/category/:categoryId', (req, res) => {

    const Op = Sequelize.Op;
    
    // Get transactions from date and year passed in query params
    const date = new Date(req.query.year, req.query.month);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return Category.findOne({
        where: {
            id: req.params.categoryId,
            user_id: req.user.id
        }
    })
    .then(category => {
        if (category) {
            return Transaction.findAll({
                where: {
                    category_id: req.params.categoryId,
                    date: {
                        [Op.gt]: firstDay,
                         [Op.lt]: lastDay
                    }
                }
            });
        }
    })
    .then(transactions => res.json({
        transactions: transactions.map(transaction => transaction.apiRepr())
    }));
});

router.post('/category/:categoryId', (req, res) => {

    const requiredFields = ['transaction', 'date', 'amount', 'category_id'];

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
    .catch(() => res.status(500).send({message: 'Internal server error'}));
});

router.put('/:id', (req, res) => {
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

    return Transaction.update(toUpdate, {
        where: {
            id: req.params.id
        },
        include: [{
            model: Category,
            as: 'categories',
            where: {
                user_id: req.user.id
            }
        }]
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error', error: err}));
});

router.delete('/:id', (req, res) => {
    return Transaction.destroy({
        where: {
            id: req.params.id
        },
        include: [{
            model: Category,
            as: 'categories',
            where: {
                user_id: req.user.id
            }
        }]
    })
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;