import { bind, wire } from "hyperhtml";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
const logo = q('.logo');
const installBtn = q('.install');
const login = q('.login-form-wrap form');
const content = q('.content');
let install = "";

window.addEventListener('beforeinstallprompt', e => {
    install = e;
    installBtn.classList.remove('d-none');
});

window.addEventListener('appinstalled', e =>{
    // logging?
})

installBtn.addEventListener('click', e =>{
    install.prompt();
    installBtn.classList.add('d-none');
})

const menu = q('.menu');
const renderMenu = bind(menu);

// const icons = [];
// const menuItems = icons.map(item => {
//     return wire()`<div class="item">
//         ${item}
//     </div>
//     `;
// });
// renderMenu`${menuItems.map(item => item)}`;


logo.addEventListener('animationend', e => {
    logo.classList.add('d-none');
})

setTimeout(() => {
    logo.classList.add('fade-out');
    content.classList.remove('d-none');
    content.classList.add('fade-in');
}, 2000);
