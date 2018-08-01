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
            .then(() => seedUserData());
    });

    describe('GET endpoint', function() {
        
        it('should return a user that matches id', function() {
            let user;
            let res;

            return User.findOne()
                .then(_user => {
                    user = _user;

                    return chai.request(app)
                .get(`/user/${user.id}`)
                })
                .then(_res => {
                    res = _res;
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.include.keys('id', 'firstName', 'lastName', 'username', 'setupStep', 'monthlySalary');
                 });
        });
    });
});