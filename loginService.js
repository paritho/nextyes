const users = require("./db/users.json");
const fs = require('fs');
const { generateString } = require('./stringService.js');
const { getNotes } = require("./noteService.js");
const path = require('path');
const { logger } = require("./logger.js");
const pathJoiner = (p) => path.join(__dirname, p);

const saveUser = (hash, user) => {
    users[hash] = user;
    fs.writeFile(pathJoiner("db/users.json"), JSON.stringify(users), error => {
        if (error) {
            logger.error('Problem writing to users for ', user)
            logger.error(error);
        } else {
            logger.info('Updated users with ', user)
        }
    });
}

module.exports.isRegistered = (hash) => {
    return !!users[hash];
}

module.exports.register = (hash, user) => {
    user.lastLogon = new Date();
    user.id = generateString();
    saveUser(hash, user);
    return {register: 'success'};
}

module.exports.login = (hash) => {
    const user = users[hash];
    user.lastLogon = new Date();
    saveUser(hash, user);
    return user;
}