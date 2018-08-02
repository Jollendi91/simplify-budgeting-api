const express = require('express');
const router = express.Router();

const {User, Bill, Category, Transaction} = require('../models');

router.get('/:id', (req, res) => User.findById(req.params.id)
    .then(user => res.json(user.apiRepr()))
);

router.post('/', (req, res) => {
    const requiredFields = ['username', 'password'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];

        if(!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.send(404).send(message);
        }
    }

    return User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        monthlySalary: req.body.monthlySalary
    })
    .then(user => res.status(201).json(user.apiRepr()))
    .catch(err => res.status(500).send({message: err.message}));
});

router.put('/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
        const message = (`Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);

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
            id: req.params.id
        }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;