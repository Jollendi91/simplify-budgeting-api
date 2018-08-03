'use strict';

const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/users');
const billsRouter = require('./routes/bills');

const app = express();

app.use(morgan('common'));
app.use(express.json());


app.use('/user', userRouter);
app.use('/bills', billsRouter);

module.exports = app;