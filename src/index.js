// import { bind, wire } from "hyperhtml";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

const app = q('#app');
// const render = bind(app);

const logo = q('.logo');
const installBtn = q('.install');
const nav = q('.nav');

logo.addEventListener('animationend', e => {
    logo.classList.add('d-none');
})

setTimeout(() =>{
    logo.classList.add('fade-out');
},2000);


installBtn.addEventListener('click', e => {

})