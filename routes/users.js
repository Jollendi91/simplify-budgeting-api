const express = require('express');
const router = express.Router();

const {User, Bill, Category, Transaction} = require('../models');

router.get('/:id', (req, res) => User.findById(req.param.id)
    .then(user => res.json(user.apiRepr()))
);