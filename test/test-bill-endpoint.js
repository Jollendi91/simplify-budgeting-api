const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const should = chai.should();

const app = require('../app');
const {User, Bill} = require('../models');

chai.use(chaiHttp);

function seedUserData() {
   return User.create({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
        monthlySalary: faker.finance.amount()
    });
}

function generateBillData(userId=null) {
    const bill = {
        bill: faker.commerce.productName(),
        amount: faker.finance.amount()
    }
}