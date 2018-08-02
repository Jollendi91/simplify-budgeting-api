const express = require('express');
const router = express.Router();

const {Bill} = require('../models');

router.get('/:userId', (req, res) => {
    Bill.findAll({
        where: {
            user_id: req.params.userId
        }
    })
    .then(bills => res.json({
        bills: bills.map(bill => bill.apiRepr())
    }))
});

router.post('/:userId', (req, res) => {
    const requiredFields = ['bill', 'amount'];

    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];

        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);

            return res.status(400).send(message);
        }
    }

    return Bill
        .create({
            bill: req.body.bill,
            amount: req.body.amount,
            user_id: req.params.userId
        })
        .then(bill => res.status(201).json(bill.apiRepr()))
        .catch(err => res.status(500).send({message: 'Internal server error'}));
});

module.exports = router;