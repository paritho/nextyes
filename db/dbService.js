const fs = require('fs');
const path = require('path');
const { logger } = require("../serverutils/logger.js");
const pathJoiner = (p) => path.join(__dirname, p);

module.exports.dbWriter = (data, path) => {
    fs.writeFile(pathJoiner(path), JSON.stringify(data), error => {
        if (error) {
            logger.error(`Problem writing to db ${error}`)
            logger.error(error);
        } else {
            logger.info(`Db write to ${path} complete`)
        }
    });

}

module.exports.saveUser = (hash, user) => {
    try {
        const users = require('./users.json') || null;
        let userToWrite;
        if (user) {
            userToWrite = user;
        } else if (users[hash]) {
            userToWrite = users[hash];
        }

        if (!userToWrite) {
            logger.error('no user provided or no user exists for hash given');
            return false;
        }

        userToWrite.lastLogon = new Date();
        users[hash] = userToWrite;

        this.dbWriter("./db/users.json", users);
    } catch (err) {
        logger.error('Error saving user to db', err)
        return false;
    }
    return true;
}