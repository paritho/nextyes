const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const server = express();
const cp = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const pathJoiner = (p) => path.join(__dirname, p);
const { salt, hasher, shaHash } = require("./serverutils/hashService.js");
const { dbWriter, saveUser, getUser } = require("./db/dbService.js");
const { logger } = require("./serverutils/logger.js");
const nodemailer = require("nodemailer");

const dotenv = require("dotenv").config();
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const HOST =
  process.env.NODE_ENV === "production"
    ? "https://www.thenextyes.app"
    : "http://localhost:8000";
const WHITE_LIST = {
  src: ["'self'", `${HOST}/assets/js/`, "'unsafe-eval'"],
  style: [
    "'self'",
    `${HOST}/assets/css`,
    "fonts.googleapis.com",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css",
  ],
  font: ["'self'", "https://fonts.gstatic.com/"],
};

if (process.env.NODE_ENV === "production") {
  logger.info("NODE_ENV set to production");
  server.use(compression());
  server.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [...WHITE_LIST.src],
        fontSrc: [...WHITE_LIST.font],
        styleSrc: [...WHITE_LIST.style],
      },
    })
  );
}

let pageViewCount = 0;

const authenticate = (hash) => {
  const auths = require("./db/authHash.json");
  const privateHash = auths[hash];
  if (!privateHash) {
    logger.error("Non-registered user tried to authenticate");
    return false;
  }
  const user = getUser(privateHash.hash);
  if (!user) {
    logger.error(`User not found when authenticating.`);
    return false;
  }
  return { user, hash: privateHash.hash };
};

const login = (hash, user) => {
  const successful = saveUser(hash, user);
  if (successful) {
    logger.info(`successful login`);
    return { success: "login" };
  }
  logger.info("Login failed");
  return { failed: "login failed" };
};

const registerNewUser = (publicHash) => {
  const { user, hash } = authenticate(publicHash);
  if (user) {
    logger.info(`${user.email} already exits`);
    return { failed: "email already registered" };
  }

  const salts = salt();
  const privateHash = {
    salt: salts,
    // hash: shaHash(`${salts}${req.body.password}`)
    // basically only keeping this to simplify changes
    // without using a password. essentialy a random password
    // generator
    hash: shaHash(salts),
  };

  const auths = require("./db/authHash.json");
  auths[publicHash] = privateHash;
  dbWriter("authHash.json", auths, "authhash");

  return privateHash;
};

const hasRegistered = (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies.user) {
    res.redirect("/index.html");
    return;
  }
  next();
};

server.use(cp());
server.use(express.static(pathJoiner("/public/assets/")));
server.use(express.json());

server.get("/cookieSignon/:hash", (req, res) => {
  if (!req.params.hash) {
    logger.info(`get request with no hash`);
    return res.status(403).send({ noop: "signon not permitted" });
  }
  const publicHash = req.params.hash;
  const { user, hash } = authenticate(publicHash);
  if (!user) {
    res.status(401).send({ failed: "failed to authenticate user" });
  }

  const result = login(hash);
  if (result.success) {
    //set cookie, expires in 3 days
    res.cookie("user", publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.send({ success: "login" });
  }
  if (result.failed) {
    logger.error(`cookieSignon failed`);
    res.status(403).send({ failed: "signon failed" });
  }
});

// only used if a user comes back to the app after 3 days
server.post("/signon", (req, res) => {
  const publicHash = hasher(`${req.body.email}`);
  const { user, hash } = authenticate(publicHash);

  if (!user) {
    logger.info(`No user for email ${req.body.email}`);
    res.status(403).send({ failed: "Email not registered" });
    return;
  }

  // const givenHash = shaHash(`${privateHash.salt}${req.body.password}`);
  // const givenHash = shaHash(privateHash.salt);

  // if we get here, problems with the salt
  // if (givenHash !== privateHash.hash) {
  //     logger.info(`password hashes don't match for user ${req.body.email}`)
  //     res.status(403).send({ failed: 'Email/Password Incorrect' });
  //     return;
  // }
  const result = login(hash);
  if (result.success) {
    logger.info(`user ${req.body.email} successful logon`);
    res.cookie("user", publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.send({ success: "login" });
    return;
  }
  if (result.failed) {
    logger.info(`Login failed for ${req.body.email}: ${result.failed}`);
    res.status(403).send({ failed: "Problem Logging In" });
  }
});

server.post("/signup", (req, res) => {
  const userdata = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
  };

  const publicHash = hasher(`${userdata.email}`);
  const privateHash = registerNewUser(publicHash);

  if (privateHash.failed) {
    res.status(403).send({ failed: "Email is already registered." });
    return;
  }

  const result = login(privateHash.hash, userdata);
  if (result.success) {
    logger.info(`${req.body.email} successful logon`);
    res.cookie("user", publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 });
    return res.send({ success: "signup successful" });
  }
  if (result.failed) {
    logger.error(`failed to register user ${userdata.email}`);
    res.status(403).send({ failed: "Error Registering New User" });
  }
});
server.get("/worker", (req, res) => {
  res.sendFile(pathJoiner("public/worker.js"));
});

server.get("/admin", (req, res) => {
  res.sendFile(pathJoiner("src/views/admin.html"));
});
let token = "";
server.post("/admin", (req, res) => {
  const users = require("./db/users.json");
  const email = req.body.email;
  const pass = req.body.password;
  const hashPass = hasher(pass);

  token = "";
  token = hasher(salt());

  if (users.admin.email === email && users.admin.password === hashPass) {
    logger.info("admin signon successful");
    return res.send({ success: "admin authenticated", authToken: token });
  }
  return res.status(403).send({ failed: "not authorized" });
});
server.post("/adminContent", (req, res) => {
  logger.info("admin content request");
  const usertoken = req.body.authToken;
  if (!usertoken || usertoken !== token) {
    logger.info("bad or no admin token");
    return res.status(403).send({ failed: "bad or no token" });
  }
  if (usertoken === token) {
    logger.info("admin token accepted");
    res.sendFile(pathJoiner("src/views/adminContent.html"));
  }
});
server.post("/winners", (req, res) => {
  logger.info("winners request");
  const usertoken = req.body.authToken;
  if (!usertoken || usertoken !== token) {
    logger.info("bad or no admin token");
    return res.status(403).send({ failed: "bad or no token" });
  }
  if (usertoken === token) {
    logger.info("admin token accepted for winners request");
    const triviaData = require("./db/scores.json");
    const users = require("./db/users.json");
    const scores = [];
    for (const [key, value] of Object.entries(triviaData)) {
      const fullUserData = users[key];
      if (fullUserData) {
        scores.push({
          name: `${fullUserData.firstName} ${fullUserData.lastName}`,
          score: value.score,
        });
      }
    }
    scores.sort((a, b) => b.score - a.score);
    scores.length = 3;
    res.send(scores);
  }
});
server.post("/findUser", (req, res) => {
  logger.info("find user request");
  const usertoken = req.body.authToken;
  if (!usertoken || usertoken !== token) {
    logger.info("bad or no admin token");
    return res.status(403).send({ failed: "bad or no token" });
  }
  if (usertoken === token) {
    const users = require("./db/users.json");
    const { firstName, lastName, email } = req.body;

    if (email) {
      const emailHash = hasher(email);
      const auths = require("./db/authHash.json");
      const privateHash = auths[emailHash].hash;
      if (users[privateHash]) {
        return res.send([users[privateHash]]);
      }
      return res.send({ failed: "user not found" });
    }

    let found = [];
    if (firstName) {
      for (const [hash, data] of Object.entries(users)) {
        if (!data || !data.firstName) {
          continue;
        }

        if (lastName) {
          if (
            data.firstName.toLowerCase() === firstName.toLowerCase() &&
            data.lastName.toLowerCase() === lastName.toLowerCase()
          ) {
            found.push(data);
          }
        } else {
          if (data.firstName.toLowerCase() === firstName.toLowerCase()) {
            found.push(data);
          }
        }
      }
      if (found.length) {
        return res.send(found);
      }
      return res.send({ failed: "user not found" });
    }

    if (lastName) {
      for (const [hash, data] of Object.entries(users)) {
        if (!data || !data.lastName) {
          continue;
        }
        if (data.lastName.toLowerCase() === lastName.toLowerCase()) {
          found.push(data);
        }
      }
      if (found.length) {
        return res.send(found);
      }
      return res.send({ failed: "user not found" });
    }
  }
});
server.post("/stats", (req, res) => {
  logger.info("stats request");
  const usertoken = req.body.authToken;
  if (!usertoken || usertoken !== token) {
    logger.info("bad or no admin token");
    return res.status(403).send({ failed: "bad or no token" });
  }
  if (usertoken === token) {
    const userList = require("./db/users.json");
    const triviaList = require("./db/scores.json");
    const { users, admin, ...rest } = userList;
    const { scores, ...others } = triviaList;
    return res.send({
      totalUsers: Object.keys(rest).length,
      triviaUsers: Object.keys(others).length,
      views: pageViewCount
    });
  }
});

server.get(["/", "/index", "/index.html"], (req, res) => {
  res.sendFile(pathJoiner("public/index.html"));
  pageViewCount++;
});
server.get(["/schedule", "/schedule.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/schedule.html"));
  pageViewCount++;
});
server.get(["/home", "/home.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/home.html"));
  pageViewCount++;
});
// server.get(["/makemyday", "/makemyday.html"], hasRegistered, (req, res) => {
//   res.sendFile(pathJoiner("src/views/makemyday.html"));
// });
server.get(["/partners", "/partners.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/partners.html"));
  pageViewCount++;
});
server.get(["/info", "/info.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/info.html"));
  pageViewCount++;
});
server.get(["/trivia", "/trivia.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/trivia.html"));
  pageViewCount++;
});
server.get(["/speakers", "/speakers.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/speakers.html"));
  pageViewCount++;
});
server.get(["/resources", "/resources.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/resources.html"));
  pageViewCount++;
});
server.get(["/notes", "/notes.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner("src/views/notes.html"));
  pageViewCount++;
});
server.get("/contact", (req, res) => {
  res.sendFile(pathJoiner(`src/views/contact.html`));
  pageViewCount++;
});
server.get(["/leaderboard", "/leaderboard.html"], hasRegistered, (req, res) => {
  res.sendFile(pathJoiner(`src/views/leaderboard.html`));
  pageViewCount++;
});
server.get("/leaders", (req, res) => {
  //get leaderboard info from server
  try {
    const scores = require("./db/scores.json");
    const topTen = Object.values(scores);
    // scores.json has an empty array at pos 0
    topTen.shift();
    const len = topTen.length;
    topTen.length = len > 10 ? 10 : len;
    res.json(topTen);
  } catch (error) {
    logger.error(`An error occured getting top ten scores: ${error}`);
    res.status(500).send({ failed: "There was a problem" });
  }
});

server.post("/score", (req, res) => {
  const publicHash = req.body.hash;
  const score = req.body.score;
  const { user, hash } = authenticate(publicHash);
  if (!user) {
    logger.error("Non-registered user tried to post score");
    res
      .status(403)
      .send({ failed: "Problem posting score, user not authenticated" });
    return;
  }

  const scores = require("./db/scores.json");
  if (scores[hash] && scores[hash].score == score) {
    logger.info("score hasn't changed for user, don't write");
    return;
  }

  scores[hash] = {
    name: `${user.firstName} ${user.lastName[0].toUpperCase()}`,
    score,
  };

  dbWriter("scores.json", scores, "leaderboard");
  logger.info(`wrote score: ${score} for user hash: ${hash}`);
});

server.post("/sendMessage", async (req, res) => {
  const publicHash = req.body.hash;
  const subject = req.body.subject;
  const text = req.body.message;
  const { user, hash } = authenticate(publicHash);
  if (!user) {
    logger.error("Non-registered user tried to send email");
    res.status(403).send({ failed: "Problem sending message." });
    return;
  }

  const transport = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  const result = await transport
    .sendMail({
      from: "no-reply@thenextyes.app",
      to: "no-reply@thenextyes.app",
      subject,
      text: `${user.firstName} ${user.lastName} says:\n ${text}`,
    })
    .catch((e) => {
      logger.error(`Problem sending email, ${e}, for ${user.email}`);
      res.status(403).send({ failed: "Problem sending message." });
      return;
    });
  logger.info(`Sent email: ${result.messageId}, from: ${user.email}`);
  return res.send({ success: "Message sent!" });
});
server.listen(8000, () => {
  console.log(`listening on 8000`);
});
