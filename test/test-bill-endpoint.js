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

    if (userId) {
        bill.user_id = userId;
    }

    return bill;
}

function seedData(seedNum=5) {
    return seedUserData()
        .then(user => {
            const promises = [];
            for (let i=0; i<seedNum; i++) {
                promises.push(Bill.create(generateBillData(user.id)));
            }
            return Promise.all(promises);
        });
}


describe(`Bill API resource`, function() {

    beforeEach(function() {
        return Bill
            .truncate({cascade: true})
            .then(() => seedData());
    });

    describe('GET endpoint', function() {
        it('should return a users bills', function() {
            let user;
            let resBill;
            let res;

            return User.findOne()
                .then(_user => {
                    user = _user;
                   
                    return chai.request(app)
                        .get(`/bills/${user.id}`);
                })
                .then(_res => {
                    res = _res;
                    res.should.have.status(200);
                    res.body.bills.should.have.lengthOf(5);

                    res.body.bills.forEach(bill => {
                        bill.should.be.an('object');
                        bill.should.include.keys('id', 'bill', 'amount');
                    });
                    resBill = res.body.bills[0];
            
                    return Bill.findById(resBill.id)  
                })
                .then(bill => {
                    resBill.id.should.equal(bill.id);
                    resBill.bill.should.equal(bill.bill);
                    resBill.amount.should.equal(bill.amount);
                    bill.user_id.should.equal(user.id);
                });
        });
    });

    describe('POST endpoint', function() {
        it('should add a bill', function() {
            const newBillData = {
                bill: faker.commerce.productName(),
                amount: faker.finance.amount()
            }

            let user;

            return User.findOne()
                .then(_user => {
                    user = _user;

                    return chai.request(app)
                        .post(`/bills/${user.id}`)
                        .send(newBillData);
                })
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
});