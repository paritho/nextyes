const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const server = express();
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const pathJoiner = (p) => path.join(__dirname, p);

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
server.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [...WHITE_LIST.src],
        fontSrc: [...WHITE_LIST.font],
        styleSrc: [...WHITE_LIST.style]
    },
}));


server.use(express.static(pathJoiner('/public/assets/')));
server.get("/worker", (req, res) => {
    res.sendFile(pathJoiner('public/worker.js'));
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

server.get(["/", '/index', '/index.html'], (req, res) => {
    res.sendFile(pathJoiner('public/index.html'));
})
server.get(["/schedule", "/schedule.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/schedule.html'));
})
server.get(["/login", "/login.html"], (req, res) => {
    res.sendFile(pathJoiner('public/views/login.html'))
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