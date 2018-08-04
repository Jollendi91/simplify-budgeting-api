'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const jwtAuth = require('./middleware/jwt-auth');

const userRouter = require('./routes/users');
const billsRouter = require('./routes/bills');
const categoryRouter = require('./routes/categories');

const app = express();

app.use(cors())
app.use(morgan('common'));
app.use(express.json());


// Protected Routes
app.use('/user', userRouter);
app.use('/bills', billsRouter);
app.use('/categories', categoryRouter);

app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

//Custom Error Handler
app.use((err, req, res, next) => {
    if (err.status) {
        const errBody = Object.assign({}, err, {nessage: err.message});
        res.status(err.status).json(errBody);
    } else {
        res.status(500).json({message: 'Internal Server Error'});
        console.error(err);
    }
});

module.exports = app;