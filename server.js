const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const server = express();
const cp = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const pathJoiner = (p) => path.join(__dirname, p);
const { salt, hash, shaHash } = require('./serverutils/hashService.js');
const { dbWriter, saveUser, getUser } = require('./db/dbService.js');
const { logger } = require('./serverutils/logger.js');
const nodemailer = require('nodemailer');

const dotenv = require('dotenv');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const HOST = process.env.NODE_ENV === 'production' ? "https://www.thenextyes.app" : "http://localhost:8000";
const WHITE_LIST = {
    src: [
        "'self'",
        `${HOST}/assets/js/`,
        "'unsafe-eval'"
    ],
    style: [
        "'self'",
        `${HOST}/assets/css`,
        'fonts.googleapis.com',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    ],
    font: [
        "'self'",
        'https://fonts.gstatic.com/'
    ]
};


if (process.env.NODE_ENV === "production") {
    logger.info('NODE_ENV set to production')
    server.use(compression());
    server.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [...WHITE_LIST.src],
            fontSrc: [...WHITE_LIST.font],
            styleSrc: [...WHITE_LIST.style]
        },
    }));
}

const login = (hash, user) => {
    const successful = saveUser(hash, user);
    if (successful) {
        logger.info(`successful login`);
        return { success: 'login' }
    }
    logger.info('Login failed')
    return { failed: 'login failed' }
}

const registerNewUser = (publicHash, user) => {
    const auths = require("./db/authHash.json");

    if (auths[publicHash]) {
        logger.info(`${user.email} already exits, signing them on`)
        return auths[publicHash]
    }

    const salts = salt();
    const privateHash = {
        salt: salts,
        // hash: shaHash(`${salts}${req.body.password}`)
        // basically only keeping this to simplify changes
        // without using a password. essentialy a random password
        // generator
        hash: shaHash(salts)
    };

    auths[publicHash] = privateHash;
    dbWriter("authHash.json", auths, 'authhash');

    return privateHash;
}

const hasRegistered = (req,res,next) => {
    const cookies = req.cookies;
    
    if(!cookies.user){
        res.redirect('/index.html');
        return;
    }
    next();
}

server.use(cp());
server.use(express.static(pathJoiner('/public/assets/')));
server.use(express.json())

server.get("/cookieSignon/:hash", (req, res) => {
    if (!req.params.hash) {
        logger.info(`get request with no hash`)
        return res.status(403).send({ noop: "signon not permitted" })
    }
    const publicHash = req.params.hash;
    const auths = require("./db/authHash.json");
    const privateHash = auths[publicHash];
    if (!privateHash) {
        res.status(403).send({ failed: 'no hash match' });
        return;
    }
    const result = login(privateHash.hash);
    if (result.success) {
        //set cookie, expires in 3 days
        res.cookie('user', publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 })
        res.send({ success: 'login' });
    }
    if (result.failed) {
        logger.error(`cookieSignon failed`)
        res.status(403).send({ failed: 'signon failed' });
    }
})

// only used if a user comes back to the app after 3 days
server.post("/signon", (req, res) => {
    const publicHash = hash(`${req.body.email}`);
    const auths = require("./db/authHash.json");
    let privateHash = auths[publicHash];
    if (!privateHash) {
        // logger.info(`No private hash for email ${req.body.email}`)
        // res.status(403).send({ failed: 'Email/Password Incorrect' });

        // assume is new visitor
        privateHash = registerNewUser(publicHash, {email: req.body.email})
        return
    }

    // const givenHash = shaHash(`${privateHash.salt}${req.body.password}`);
    const givenHash = shaHash(privateHash.salt);

    // if we get here, problems with the salt
    if (givenHash !== privateHash.hash) {
        logger.info(`password hashes don't match for user ${req.body.email}`)
        res.status(403).send({ failed: 'Email/Password Incorrect' });
        return;
    }

    const result = login(privateHash.hash);
    if (result.success) {
        logger.info(`user ${req.body.email} successful logon`)
        res.cookie('user', publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 })
        res.send({ success: 'login' });
    }
    if (result.failed) {
        logger.info(`Login failed for ${req.body.email}: ${result.failed}`)
        res.status(403).send({ failed: 'Problem Logging In' });
    }
})


server.post('/signup', (req, res) => {
    const userdata = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    };

    const publicHash = hash(`${userdata.email}`);
    const privateHash = registerNewUser(publicHash, userdata)

    const result = login(privateHash.hash, userdata);
    if (result.success) {
        logger.info(`${req.body.email} successful logon`)
        res.cookie('user', publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 })
        return res.send({ success: 'signup successful' });
    }
    if (result.failed) {
        logger.error(`failed to register user ${userdata.email}`)
        res.status(403).send({ failed: 'Error Registering New User' });
    }
})
server.get("/worker", (req, res) => {
    res.sendFile(pathJoiner('public/worker.js'));
});

server.get(["/", '/index', '/index.html'], (req, res) => {
    res.sendFile(pathJoiner('public/index.html'));
})
server.get(["/schedule", "/schedule.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/schedule.html'));
})
server.get(["/home", "/home.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/home.html'))
})
server.get(["/makemyday", "/makemyday.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/makemyday.html'))
})
server.get(["/partners", "/partners.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/partners.html'))
})
server.get(["/speakers", "/speakers.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/speakers.html'))
})
server.get(["/resources", "/resources.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/resources.html'))
})
server.get(["/notes", "/notes.html"], hasRegistered, (req, res) => {
    res.sendFile(pathJoiner('src/views/notes.html'))
})
server.get(["/contact","/makemyday"], hasRegistered, (req, res) => {
    const page = req.path;
    res.sendFile(pathJoiner(`src/views${page}.html`))
})
server.post("/sendMessage", async (req,res)=> {
    const publicHash = req.body.hash;
    const subject = req.body.subject;
    const text = req.body.message;
    const auths = require("./db/authHash.json");
    const privateHash = auths[publicHash];
    if (!privateHash) {
        logger.error('Non-registered user tried to send email');
        res.status(403).send({ failed: 'Problem sending message.' });
        return;
    }
    const user = getUser(privateHash.hash);
    if(!user) {
        logger.error(`Problem getting user info for private hash.`);
        res.status(403).send({ failed: 'Problem sending message.' });
        return;
    }

    const transport = nodemailer.createTransport({
        host:"smtp.office365.com",
        port:587,
        auth:{
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
    const result = await transport.sendMail({
        from: "no-reply@thenextyes.app",
        to:"makemyday@thenextyes.app",
        subject,
        text:`${user.firstName} ${user.lastName} says: ${text}`
    }).catch(e => {
        logger.error(`Problem sending email, ${e}, for ${user.email}`)
        res.status(403).send({ failed: 'Problem sending message.' });
        return;
    })
    logger.info(`Sent email: ${result.messageId}, from: ${user.email}`)
    return res.send({ success: 'Message sent!' });
})
server.listen(8000, () => {
    console.log(`listening on 8000`)
})

