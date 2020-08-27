const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const server = express();
const fs = require('fs');
const path = require('path');
const pathJoiner = (p) => path.join(__dirname, p);
const { generateString, hash } = require('./stringService.js');
const { makeNote, getNotes } = require("./noteService.js");
const { isRegistered, login, register } = require('./loginService.js');
const { logger } = require('./logger.js');

const HOST = process.env.NODE_ENV === 'production' ? "https://www.thenextyes.app" : "http://localhost:8000";
const WHITE_LIST = {
    src: [
        "'self'",
        `${HOST}/assets/js/`,
        ''
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
// server.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [...WHITE_LIST.src],
//         fontSrc: [...WHITE_LIST.font],
//         styleSrc: [...WHITE_LIST.style]
//     },
// }));


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
server.get("/login/:hash", (req, res) => {
    const userhash = req.params.hash;
    const user = login(userhash);
    const notes = getNotes(user.id);
    //set cookie, expires in 3 days
    res.cookie('user', userhash, {maxAge: 3*24*60*60*1000 })
    res.send({login: 'success', notes});   
})

server.post('/register', (req, res) =>{
    const userdata = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    };
    const userhash = hash(`${userdata.firstName}${userdata.lastName}${userdata.email}`);
    const result = register(userhash, userdata);
    res.cookie('user', userhash, {maxAge: 3*24*60*60*1000})
    res.send(result);
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