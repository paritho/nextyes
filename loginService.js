const fs = require('fs');
const path = require('path');
const { logger } = require("./logger.js");
const pathJoiner = (p) => path.join(__dirname, p);

const saveUser = (hash, user) => {
    try {
        const users = require('./db/users.json') || null;
        let userToWrite;
        if(user){
            userToWrite = user;
        } else if(users[hash]){
            userToWrite = users[hash];
        }

        if(!userToWrite) {
            logger.error('no user provided or no user exists for hash given');
            return false;
        }

        userToWrite.lastLogon = new Date();
        users[hash] = userToWrite;

        fs.writeFile(pathJoiner("db/users.json"), JSON.stringify(users), error => {
            if (error) {
                logger.error('Problem writing to users for ', user)
                logger.error(error);
            } else {
                logger.info('Saved user')
            }
        });
    } catch (err){
        logger.error('Error writing to db', err)
        return false;
    }
    return true;
}

module.exports.login = (hash, user = false) => {
    const successful = saveUser(hash, user);
    if(successful){
        logger.info(`successful login`);
        return {success: 'login'}
    }
    logger.info('Login failed')
    return {failed: 'login failed'}
}