const express = require('express');
const server = express();
const fs = require('fs');
const path = require('path');

const pathJoiner = (p) => path.join(__dirname, p);


server.use(express.static(pathJoiner('public')));

server.get("/schedule", (req, res)=> {
    res.sendFile(pathJoiner('public/views/schedule.html'));
})

server.get("/login", (req, res)=>{
    res.sendFile(pathJoiner('public/views/login.html'))
})

server.listen(8000, () =>{
    console.log('listening on 8000')
})