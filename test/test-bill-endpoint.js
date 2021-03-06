'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const app = require('../app');
const {User, Bill} = require('../models');
const {JWT_SECRET, JWT_EXPIRY} = require('../config/config');

chai.use(chaiHttp);
const should = chai.should();

let authToken;
let user;

function seedUserData() {
    user = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password()
    };

    return User.hashPassword(user.password)
    .then(hash => User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: hash,
        setupStep: 1,
        monthlySalary: faker.finance.amount()
    }))
    .then(_user => {
        user = _user.apiRepr();
        authToken = jwt.sign({user}, JWT_SECRET, {expiresIn: JWT_EXPIRY});
    });
}

function generateBillData(userId=null) {
    const bill = {
        bill: faker.commerce.productName(),
        amount: faker.finance.amount()
    }

    if (userId) {
        bill.user_id = userId;
    }

    return bill;
}

function seedData(seedNum=5) {
    return seedUserData()
        .then(() => {
            const promises = [];
            for (let i=0; i<seedNum; i++) {
                promises.push(Bill.create(generateBillData(user.id)));
            }
            return Promise.all(promises);
        });
}

describe(`Bill API resource`, function() {

    beforeEach(function() {
        return User.truncate({cascade: true})
            .then(() => seedData());
    });

    describe('GET user info', function() {
        it('should return bill info on GET dashboard', function() {
            
            let resBill;

            return chai.request(app)
                .get('/simplify/dashboard')
                .set('Authorization', `Bearer ${authToken}`)
                .then(res => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.bills.should.be.an('array');
                    res.body.bills.should.have.lengthOf(5);
                    
                    res.body.bills.map(bill => {
                        bill.should.be.an('object');
                        bill.should.include.keys('id', 'bill', 'amount');
                    });

                    resBill = res.body.bills[0];

                    return Bill.findById(resBill.id);
            })
            .then(bill => {
                bill.id.should.equal(resBill.id);
                bill.bill.should.equal(resBill.bill);
                bill.amount.should.equal(resBill.amount);
                bill.user_id.should.equal(user.id);
            });
        });
    })

    describe('POST endpoint', function() {
        it('should add a bill', function() {

            const newBillData = {
                bill: faker.commerce.productName(),
                amount: faker.finance.amount()
            }

            return chai.request(app)
            .post(`/simplify/bills`)
            .send(newBillData)
            .set('Authorization', `Bearer ${authToken}`)
            .then(res => {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.should.include.keys('id', 'bill', 'amount');
                res.body.id.should.not.be.null;
                res.body.bill.should.equal(newBillData.bill);
                res.body.amount.should.equal(newBillData.amount);

                return Bill.findById(res.body.id)
            })
            .then(bill => {
                bill.bill.should.equal(newBillData.bill);
                bill.amount.should.equal(newBillData.amount);
                bill.user_id.should.equal(user.id);
            });
        });
    });

    describe('PUT endpoint', function() {
        it('should update a bill with fields you send over', function() {
            const updateData = {
                bill: 'Rent',
                amount: '450.50'
            }

           return Bill.findOne()
            .then(bill => {
                updateData.id = bill.id;

                return chai.request(app)
                    .put(`/simplify/bills/${bill.id}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(updateData);
            })
            .then(res => {
                res.should.have.status(204);

                return Bill.findById(updateData.id);
            })
            .then(bill => {
                bill.id.should.equal(updateData.id);
                bill.bill.should.equal(updateData.bill);
                bill.amount.should.equal(updateData.amount);
                bill.user_id.should.equal(user.id);
            });
        });
    });

    describe('DELETE endpoint', function() {
        it('should delete a bill by id', function() {
            let bill;
            
            return Bill.findOne()
                .then(_bill => {
                    bill = _bill;
                    return chai.request(app)
                    .delete(`/simplify/bills/${bill.id}`)
                    .set('Authorization', `Bearer ${authToken}`);
                })
                .then(res => {
                    res.should.have.status(204);

                    return Bill.findById(bill.id);
                })
                .then(_bill => {
                    should.not.exist(_bill);
                });
        });
    });
});