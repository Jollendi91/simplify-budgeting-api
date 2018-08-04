const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const app = require('../app');
const {User} = require('../models');

chai.use(chaiHttp);

function seedUserData(seedNum=1) {
    const users = [];
    for (let i=0; i<seedNum; i++) {
        users.push(generateUserData());
    }
    return Promise.all(users);
}

let authToken;
let user;

function generateUserData() {
    user = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        setupStep: 1,
        monthlySalary: faker.finance.amount()
    };

    return chai.request(app)
    .post('/simplify/users')
    .send(user)
    .then(res => {
        user.id = res.body.id;
        return chai.request(app)
        .post('/simplify/auth/login')
        .send({username: user.username, password: user.password});
    })
    .then(res => {
        authToken = res.body.authToken;
    });
}

describe('Users API resource', function() {
    
    beforeEach(function() {
        return User
            .truncate({cascade: true})
            .then(() => seedUserData());
    });

    describe('GET endpoint', function() {
        
        it('should return a user that matches id', function() {
                    
            return chai.request(app)
                .get(`/simplify/userinfo`)
                .set("Authorization", `Bearer ${authToken}`)
                .then(res => {
                    res.should.have.status(200);
                    res.body.id.should.equal(user.id);
                 });
        });

        it('should return user with correct fields', function() {
    
            return chai.request(app)
            .get(`/simplify/userinfo`)
            .set('Authorization', `Bearer ${authToken}`)
            .then(res => {
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.include.keys('id', 'username', 'setupStep', 'monthlySalary');
                res.body.id.should.equal(user.id);
                res.body.username.should.equal(user.username);
                res.body.setupStep.should.equal(user.setupStep);
                res.body.monthlySalary.should.equal(user.monthlySalary);
            });
        });
    });

    describe('POST endpoint', function() {

        it('should add a new user', function() {
            const newUserData = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                username: faker.internet.userName(),
                password: faker.internet.password(),
                monthlySalary: faker.finance.amount()
            }

            return chai.request(app)
                .post('/simplify/users')
                .send(newUserData)
                .then(res => {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.should.be.an('object');
                    res.body.should.include.keys('id', 'username', 'setupStep', 'monthlySalary');
                    res.body.username.should.equal(newUserData.username);
                    res.body.monthlySalary.should.equal(newUserData.monthlySalary);
                    res.body.setupStep.should.equal(1);

                    newUserData.id = res.body.id;

                    return User.findById(res.body.id);
                })
                .then(user => {
                    user.id.should.equal(newUserData.id);
                    user.firstName.should.equal(newUserData.firstName);
                    user.lastName.should.equal(newUserData.lastName);
                    user.username.should.equal(newUserData.username);
                    user.setupStep.should.equal(1);
                    user.monthlySalary.should.equal(newUserData.monthlySalary);
                });
        });
    });

    describe('PUT endpoint', function() {
        it('should update fields you send over', function() {
            const updateData = {
                setupStep: 2,
                monthlySalary: faker.finance.amount()
            };

    

        return chai.request(app)
        .put(`/simplify/userinfo`)
        .send(updateData)
        .set('Authorization', `Bearer ${authToken}`)
        .then(res => {
            res.should.have.status(204);

            return User.findById(user.id)
        })
        .then(user => {
            user.setupStep.should.equal(updateData.setupStep);
            user.monthlySalary.should.equal(updateData.monthlySalary);
        });
        });
    });
});