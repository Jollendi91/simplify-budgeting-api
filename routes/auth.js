'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const localAuth = require('../middleware/local-auth');
const jwtAuth = require('../middleware/jwt-auth');

const {JWT_SECRET, JWT_EXPIRY} = require('../config/config');

const router = express.Router();