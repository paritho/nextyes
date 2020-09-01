const fs = require('fs');
const path = require('path');
const { logger } = require("./logger.js");
const pathJoiner = (p) => path.join(__dirname, p);

const openDb = () => {
    let users, db;
    try {
        db = fs.readFileSync(pathJoiner('db/users.json'));
        users = JSON.parse(db);
    } catch(err){
        logger.error('Error reading from db', err);
        return;
    }
    return users;
}

const saveUsers = (users) => {
    try {
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
        return;
    }
    return true;
}

module.exports.register = (hash, user) => {
    const users = openDb();
    user.lastLogon = new Date();
    users[hash] = user;
    saveUsers(users);
    return {success: 'new user registered'}
}

module.exports.login = (hash) => {
    const users = openDb();
    let user, msg = "login";

    if(users){
        user = users[hash] ? users[hash] : null;
    }
    if(user){
        user && (user.lastLogon = new Date());
        users[hash] = user;
        saveUsers(users);
        logger.info(`${user.email} successful login`);
        return {success: 'login'}
    }
    logger.info('Login failed, no user for hash', hash)
    return {failed: 'user not found'}
}