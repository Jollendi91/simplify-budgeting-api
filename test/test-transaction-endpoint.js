'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const app = require('../app');
const {User, Category, Transaction} = require('../models');

chai.use(chaiHttp);

let authToken;
let user;

function seedUserData() {
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
        return
    });
}

function seedCategoryData(userId=null) {
    const category = {
        category: faker.commerce.productName(),
        amount: faker.finance.amount()
    }

    if(userId) {
        category.user_id = userId;
    }

    return Category.create(category);
}


function generateTransactionData(categoryId=null) {
    const transaction = {
        transaction: faker.commerce.productName(),
        date: new Date(),
        amount: faker.finance.amount()
    }

    if (categoryId) {
        transaction.category_id = categoryId;
    }

    return transaction;
}

function seedData(seedNum=3) {
    return seedUserData()
        .then(() => seedCategoryData(user.id))
        .then(category => {
            
            const promises = [];
            for (let i=0; i<seedNum; i++) {
                promises.push(Transaction.create(generateTransactionData(category.id)));
            }
            return Promise.all(promises);
        });
}

describe('Transaction API resource', function() {

    beforeEach(function() {
        return Category.truncate({cascade: true})
            .then(() => User.truncate({cascade: true}))
            .then(() => seedData());
    });

    describe('GET transactions by eager loading', function() {

        it('should return transactions with category GET', function() {
            let resTransaction;
            let resCategory;

            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            return chai.request(app)
                .get('/simplify/categories')
                .query({year, month})
                .set('Authorization', `Bearer ${authToken}`)
                .then(res => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.categories.should.have.lengthOf(1);
                    res.body.categories[0].transactions.should.be.an('array');
                    res.body.categories[0].transactions.should.have.lengthOf(3);

                    res.body.categories[0].transactions.map(transaction => {
                        transaction.should.be.an('object');
                        transaction.should.include.keys('id', 'transaction', 'date', 'amount');
                    });

                    resCategory = res.body.categories[0];
                    resTransaction = res.body.categories[0].transactions[0];

                    return Transaction.findById(resTransaction.id);
                })
                .then(transaction => {
                    transaction.id.should.equal(resTransaction.id);
                    transaction.transaction.should.equal(resTransaction.transaction);
                    transaction.date.should.equal(resTransaction.date);
                    transaction.amount.should.equal(resTransaction.amount);
                    transaction.category_id.should.equal(resCategory.id);
                });
        });

        it('should return transactions on GET userinfo', function() {
            
            let resTransaction;
            let resCategory;

            return chai.request(app)
                .get('/simplify/userinfo')
                .set('Authorization', `Bearer ${authToken}`)
                .then(res => {
                
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.categories.should.have.lengthOf(1);
                    res.body.categories[0].transactions.should.have.lengthOf(3);
                    res.body.categories[0].transactions.should.be.an('array');

                    res.body.categories[0].transactions.map(transaction => {
                        transaction.should.be.an('object');
                        transaction.should.include.keys('id', 'transaction', 'date', 'amount');
                    });

                    resCategory = res.body.categories[0];
                    resTransaction = res.body.categories[0].transactions[0];

                    return Transaction.findById(resTransaction.id);
            })
            .then(transaction => {
                transaction.id.should.equal(resTransaction.id);
                transaction.transaction.should.equal(resTransaction.transaction);
                transaction.date.should.equal(resTransaction.date);
                transaction.amount.should.equal(resTransaction.amount);
                transaction.category_id.should.equal(resCategory.id);
            });
        });
    });

    describe('POST endpoint', function() {

        it('Should add a transaction', function() {
            
            let date = new Date().toISOString().split('T')[0];
            const newTransaction = {
                transaction: faker.commerce.productName(),
                date: date,
                amount: faker.finance.amount()
            };
            
            let category;

            return Category.findOne()
                .then(_category => {
                    category = _category;

                    newTransaction.category_id = category.id;

                    return chai.request(app)
                        .post(`/simplify/transactions/category/${_category.id}`)
                        .send(newTransaction)
                        .set('Authorization', `Bearer ${authToken}`);
                })
                .then(res => {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.an('object');
                    res.body.should.include.keys('id', 'transaction', 'date', 'amount');
                    res.body.id.should.not.be.null;
                    res.body.transaction.should.equal(newTransaction.transaction);
                    res.body.date.should.equal(newTransaction.date);
                    res.body.amount.should.equal(newTransaction.amount);

                    return Transaction.findById(res.body.id);
                })
                .then(transaction => {
                    transaction.transaction.should.equal(newTransaction.transaction);
                    transaction.date.should.equal(newTransaction.date);
                    transaction.amount.should.equal(newTransaction.amount);
                    transaction.category_id.should.equal(category.id);
                });
        });
    });
});