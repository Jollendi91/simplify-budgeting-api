'use strict';
const dotenv = require('dotenv');
dotenv.config({path: './.env'});
const {PORT} = require('./config/config');
const app = require('./app');

let server;

function runServer(port) {
    return new Promise((resolve, reject) => {
        try {
            server = app.listen(port, () => {
                console.log(`App listening on port ${port}`);
                resolve();
            });
        }
        catch (err) {
            console.error(`Can't start server: ${err}`);
        }
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

if (require.main === module) {
    runServer(PORT).catch( err => {
        console.error(`Can't start server: ${err}`);
        throw err;
    });
};

module.exports = {runServer, closeServer};