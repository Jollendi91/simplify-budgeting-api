const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const app = require('../app');
const {User} = require('../models');
const {JWT_SECRET} = require('../config/config');

chai.use(chaiHttp);
const should = chai.should();

describe('JWT Authorization resource', function () {
    let user;
    let username;
    let password;

    beforeEach(function () {
        username = faker.internet.userName();
        password = faker.internet.password();

        return User.hashPassword(password)
            .then(hash => User.create({
                username,
                password: hash
            }))
            .then(_user => {
                user = _user;
            });
    });

    describe('POST login endpoint', function () {

        it('Should return a valid JWT with correct login info', function () {
            return chai.request(app)
                .post('/simplify/auth/login')
                .send({
                    username,
                    password
                })
                .then(res => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.an('object');
                    res.body.authToken.should.be.a('string');
                    jwt.verify(res.body.authToken, JWT_SECRET);
                });
        });

        it('should return a valid JWT with correct fields', function () {
            return chai.request(app)
                .post('/simplify/auth/login')
                .send({
                    username,
                    password
                })
                .then(res => {
                    const payload = jwt.verify(res.body.authToken, JWT_SECRET);

                    payload.user.id.should.equal(user.id);
                    payload.user.username.should.equal(user.username);
                    payload.user.setupStep.should.equal(1);
                    payload.user.monthlySalary.should.equal("0");
            });
        });

        it('should return a JWT that does not contain a password', function () {
            return chai.request(app)
            .post('/simplify/auth/login')
                .send({
                    username,
                    password
                })
            .then(res => {
                const payload = jwt.verify(res.body.authToken, JWT_SECRET);
                payload.should.not.have.property("password");
            });
        });
    });
});