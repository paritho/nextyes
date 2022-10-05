const fs = require("fs");
const path = require("path");
const { logger } = require("../serverutils/logger.js");

module.exports.dbWriter = (filepath, data, type) => {
  fs.writeFile(
    path.join(__dirname, filepath),
    JSON.stringify(data),
    (error) => {
      if (error) {
        logger.error(`Problem writing ${type} to db ${error}`);
        logger.error(error);
      } else {
        logger.info(`${type} db write to ${filepath} complete`);
      }
    }
  );
};

module.exports.getUser = (hash) => {
  try {
    const users = require("./users.json");
    return users[hash] || null;
  } catch (err) {
    logger.error(`Couldn't find user with hash ${hash}`);
  }
};

module.exports.saveUser = (hash, user) => {
  try {
    const users = require("./users.json") || null;
    let userToWrite;
    if (user) {
      userToWrite = user;
    } else if (users[hash]) {
      userToWrite = users[hash];
    }

    if (!userToWrite) {
      logger.error("no user provided or no user exists for hash given");
      return false;
    }

    userToWrite.lastLogon = new Date();
    users[hash] = userToWrite;

    this.dbWriter("./users.json", users, "save user");
  } catch (err) {
    logger.error("Error saving user to db", err);
    return false;
  }
  return true;
};
