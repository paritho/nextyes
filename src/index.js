import { bind, wire } from "hyperhtml";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

const app = q('#app');
// const render = bind(app);

const logo = q('.logo');
const installBtn = q('.install');

const menu = q('.menu');
const renderMenu = bind(menu);

const pages = ["schedule", "speakers", "partners", "make my day", "resources"];
const menuItems = pages.map(item => {
    return wire()`<div class="item">
        <p>${item}</p>
    </div>
    `;
});
renderMenu`${menuItems.map(item => item)}`;


logo.addEventListener('animationend', e => {
    logo.classList.add('d-none');
})

setTimeout(() => {
    logo.classList.add('fade-out');
}, 2000);


installBtn.addEventListener('click', e => {

})