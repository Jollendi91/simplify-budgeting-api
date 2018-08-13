const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const should = chai.should();

const app = require('../app');
const {User, Category} = require('../models');
const {JWT_SECRET, JWT_EXPIRY} = require('../config/config');

chai.use(chaiHttp);

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

function generateCategoryData(userId=null) {
    const category = {
        category: faker.commerce.productName(),
        amount: faker.finance.amount()
    }

    if(userId) {
        category.user_id = userId;
    }
    
    return category;
}

function seedData(seedNum=3) {
    return seedUserData()
        .then(() => {
            const promises = [];
            for (let i=0; i<seedNum; i++) {
                promises.push(Category.create(generateCategoryData(user.id)));
            }
            return Promise.all(promises);
        });
}

describe('Category API resource', function() {

    beforeEach(function() {
        return Category
            .truncate({cascade: true})
            .then(() => {
                return User.truncate({cascade: true});
            })
            .then(() => seedData());
    });

    describe('GET user info', function() {
        it('should return category info on GET dashboard', function() {
            
            let resCategory;

            return chai.request(app)
                .get('/simplify/dashboard')
                .set('Authorization', `Bearer ${authToken}`)
                .then(res => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.categories.should.have.lengthOf(3);
                    res.body.categories[0].transactions.should.be.an('array');

                    res.body.categories.map(category => {
                        category.should.be.an('object');
                        category.should.include.keys('id', 'category', 'amount', 'transactions');
                    });

                    resCategory = res.body.categories[0];

                    return Category.findById(resCategory.id);
            })
            .then(category => {
                category.id.should.equal(resCategory.id);
                category.amount.should.equal(resCategory.amount);
                category.user_id.should.equal(user.id);
            });
        });
    })

    describe('POST endpoint', function() {

        it('should add a category', function() {
            const newCategoryData = {
                    category: faker.commerce.productName(),
                    amount: faker.finance.amount()
                };

            return chai.request(app)
            .post('/simplify/categories')
            .send(newCategoryData)
            .set('Authorization', `Bearer ${authToken}`)
            .then(res => {
                res.should.have.status(201);
                res.should.be.json;
                res.should.be.an('object');
                res.body.should.have.keys('id', 'category', 'amount');
                res.body.id.should.not.be.null;
                res.body.category.should.equal(newCategoryData.category);
                res.body.amount.should.equal(newCategoryData.amount);

                return Category.findById(res.body.id);
            })
            .then(category => {
                category.category.should.equal(newCategoryData.category);
                category.amount.should.equal(newCategoryData.amount);
                category.user_id.should.equal(user.id);
            });
        });
    });

    describe('PUT endpoint', function() {

        it('should update a category with fields you send over', function() {
            
            const updateData = {
                category: 'updated Category',
                amount: '500'
            }

            return Category.findOne()
            .then(category => {
                updateData.id = category.id;

                return chai.request(app)
                .put(`/simplify/categories/${category.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            })
            .then(res => {
                res.should.have.status(204);

                return Category.findById(updateData.id);
            })
            .then(category => {
                category.id.should.equal(updateData.id);
                category.category.should.equal(updateData.category);
                category.amount.should.equal(updateData.amount);
                category.user_id.should.equal(user.id);            
            });
        });
    });

    describe('DELETE endpoint', function() {

        it('should delete a category by id', function() {
            let category;

            return Category.findOne()
            .then(_category => {
                category = _category;

                return chai.request(app)
                .delete(`/simplify/categories/${category.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            })
            .then(res => {
                res.should.have.status(204);
                
                return Category.findById(category.id);
            })
            .then(_category => {
                should.not.exist(_category);
            });
        });
    });
});