'use strict';

const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const {User, Bill, Category, Transaction} = require('../models');

const Op = Sequelize.Op;

// Eager load only current month transactions
const date = new Date();
const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

router.get('/', (req, res) => User.findOne({
    where: {
        id: req.user.id
    },
    include: [{
        model: Bill,
        as: 'bills',
        required: false
    },
    {
        model: Category,
        as: 'categories',
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
    }
    ]
    })
    .then(user => {
        const bills = user.bills.map(bill => bill.apiRepr());

        const categories = user.categories.map(category => {
            const transactions = category.transactions.map(transaction => transaction.apiRepr());

            return category.apiRepr(transactions);
        });

        return res.json(user.apiRepr(bills, categories));
    })
);

router.put('/', (req, res) => {
    
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
    .catch(() => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;