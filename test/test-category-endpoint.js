const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const app = require('../app');
const {User, Category} = require('../models');

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

    describe('GET endpoint', function() {
        it('should return a users categories', function() {

            let resCategory;

            return chai.request(app)
            .get(`/simplify/categories`)
            .set('Authorization', `Bearer ${authToken}`)
            .then(res => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.categories.should.have.lengthOf(3);

                res.body.categories.forEach(category => {
                    category.should.be.an('object');
                    category.should.include.keys('id', 'category', 'amount');
                });

                resCategory = res.body.categories[0];

                return Category.findById(resCategory.id);
            })
            .then(category => {
                category.id.should.equal(resCategory.id);
                category.category.should.equal(resCategory.category);
                category.amount.should.equal(resCategory.amount);
                category.user_id.should.equal(user.id);
            });
        });
    });
});

