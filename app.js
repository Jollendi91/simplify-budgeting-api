'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./routes/users');
const billsRouter = require('./routes/bills');
const categoryRouter = require('./routes/categories');

const app = express();

app.use(cors())
app.use(morgan('common'));
app.use(express.json());


app.use('/user', userRouter);
app.use('/bills', billsRouter);
app.use('/categories', categoryRouter);

module.exports = app;