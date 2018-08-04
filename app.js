'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const jwtAuth = require('./middleware/jwt-auth');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const userInfoRouter = require('./routes/user-info');
const billsRouter = require('./routes/bills');
const categoryRouter = require('./routes/categories');

const app = express();

app.use(cors())
app.use(morgan('common'));
app.use(express.json());

// Public Routes
app.use('/simplify/user', userRouter);

// Protected Routes
app.use('/simplify/userinfo', jwtAuth, userInfoRouter)
app.use('/simplify/bills', jwtAuth, billsRouter);
app.use('/simplify/categories', jwtAuth, categoryRouter);

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