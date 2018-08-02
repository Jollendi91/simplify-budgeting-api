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

function generateUserData() {
    User.create({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        monthlySalary: faker.finance.amount()
    });
}

describe('Users API resource', function() {
    
    beforeEach(function() {
        return User
            .truncate({cascade: true})
            .then(seedUserData());
    });

    describe('GET endpoint', function() {
        
        it('should return a user that matches id', function() {
            let user;

            return User.findOne()
                .then(_user => {
                    user = _user;
                    
                    return chai.request(app)
                .get(`/user/${user.id}`);
                })
                .then(res => {
                    res.should.have.status(200);
                    res.body.id.should.equal(user.id);
                 });
        });

        it('should return user with correct fields', function() {
            let user;

            return User.findOne()
                .then(_user => {
                   user = _user;
                   
                   return chai.request(app)
                    .get(`/user/${user.id}`);
                })
                .then(res => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.include.keys('id', 'firstName', 'lastName', 'username', 'setupStep', 'monthlySalary');
                    res.body.id.should.equal(user.id);
                    res.body.firstName.should.equal(user.firstName);
                    res.body.lastName.should.equal(user.lastName);
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
                .post('/user')
                .send(newUserData)
                .then(res => {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.should.be.an('object');
                    res.body.should.include.keys('id', 'firstName', 'lastName', 'username', 'setupStep', 'monthlySalary');
                    res.body.firstName.should.equal(newUserData.firstName);
                    res.body.lastName.should.equal(newUserData.lastName);
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

    describe('POST endpoint', function() {
        it('should update fields you send over', function() {
            const updateData = {
                setupStep: 2,
                monthlySalary: faker.finance.amount()
            };

            return User.findOne()
                .then(user => {
                    updateData.id = user.id;

                    return chai.request(app)
                    .put(`/user/${user.id}`)
                    .send(updateData);
                })
                .then(res => {
                    res.should.have.status(204);

                    return User.findById(updateData.id)
                })
                .then(user => {
                    user.setupStep.should.equal(updateData.setupStep);
                    user.monthlySalary.should.equal(updateData.monthlySalary);
                });
        });
    });
});