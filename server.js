const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const server = express();
const fs = require('fs');
const path = require('path');
const pathJoiner = (p) => path.join(__dirname, p);
const { salt, hash, shaHash } = require('./stringService.js');
const { makeNote, getNotes } = require("./noteService.js");
const { login } = require('./loginService.js');
const { logger } = require('./logger.js');

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


server.use(compression());
server.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [...WHITE_LIST.src],
        fontSrc: [...WHITE_LIST.font],
        styleSrc: [...WHITE_LIST.style]
    },
}));


server.use(express.static(pathJoiner('/public/assets/')));
server.use(express.json())

server.get("/worker", (req, res) => {
    res.sendFile(pathJoiner('public/worker.js'));
});

server.get(["/", '/index', '/index.html'], (req, res) => {
    res.sendFile(pathJoiner('public/index.html'));
})
server.get(["/schedule", "/schedule.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/schedule.html'));
})
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

server.post("/signon", (req, res) => {
    const publicHash = hash(`${req.body.email}`);
    const auths = require("./db/authHash.json");
    const privateHash = auths[publicHash];
    if (!privateHash) {
        res.status(403).send({ failed: 'no matching user' });
        return;
    }

    const givenHash = shaHash(`${privateHash.salt}${req.body.password}`);
    if (givenHash !== privateHash.hash) {
        res.status(403).send({ failed: 'private hash missmatch' });
        return;
    }
    const result = login(privateHash.hash);
    if (result.success) {
        //set cookie, expires in 3 days
        res.cookie('user', publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 })
        res.send({ success: 'login' });
    }
    if (result.failed) {
        res.status(403).send({ failed: 'signon failed' });
    }
})

server.post('/signup', (req, res) => {
    const userdata = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    };
    const auths = require("./db/authHash.json");
    const publicHash = hash(`${req.body.email}`);

    if (auths[publicHash]) {
        return res.send({ dupemail: 'user already exists' });
    }

    const salts = salt();
    const privateHash = {
        salt: salts,
        hash: shaHash(`${salts}${req.body.password}`)
    };

    auths[publicHash] = privateHash;
    try {
        fs.writeFile(pathJoiner("db/authHash.json"), JSON.stringify(auths), error => {
            if (error) {
                logger.error('Problem writing private hashes')
                logger.error(error);
            } else {
                logger.info('Set private hashes for new user.')
            }
        });
    } catch (err) {
        logger.error('Error writing to db', err)
    }

    const result = login(privateHash.hash, userdata);
    if (result.success) {
        res.cookie('user', publicHash, { maxAge: 3 * 24 * 60 * 60 * 1000 })
        return res.send({success:'signup successful'});
    }
    if (result.failed) {
        logger.error(`failed to register user ${userdata.email}`)
        res.status(403).send({ failed: 'Error registering new user' });
    }
})

server.get(["/home", "/home.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/home.html'))
})
server.get(["/makemyday", "/makemyday.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/makemyday.html'))
})
server.get(["/partners", "/partners.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/partners.html'))
})
server.get(["/speakers", "/speakers.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/speakers.html'))
})
server.get(["/resources", "/resources.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/resources.html'))
})
server.listen(8000, () => {
    console.log(`listening on 8000`)
})