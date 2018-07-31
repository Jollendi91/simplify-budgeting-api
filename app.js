'use strict';

const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/users');


const app = express();

app.use(morgan('common'));
app.use(express.json());


app.use('/user', userRouter);

module.exports = app;