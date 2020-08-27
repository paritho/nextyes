import { bind, wire } from "hyperhtml";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
const logo = q('.logo');
const installBtn = q('.install');
const actions = q('.actions');
const content = q('.content');
const loginBtn = q('.loginBtn');
const loginForm = q('.login-form');
let install = "";

window.addEventListener('beforeinstallprompt', e => {
    install = e;
    installBtn.classList.remove('d-none');
});

window.addEventListener('appinstalled', e => {
    // logging?
})

installBtn.addEventListener('click', e => {
    install.prompt();
    installBtn.classList.add('d-none');
});

const getCookie = (name) => {
    if(!document.cookies) {
        return;
    }
    const cookies = document.cookies.split(';');
    const keyvalpairs = cookies.map(cookie => {
        return cookie.split('=');
    });
    const cookie = keyvalpairs.find(pair => pair[0] === name);
    return cookie[1];
};

const cookie = document.cookie;
let data;
if(cookie){
    data = cookie.split(";");
    data = data[0].split("=");
}
let hash = null;
if(data){
    if(data[0] && data[0] === 'user'){
        hash = data[1] ? data[1] : null;
    }
}
if(hash){
    fetch(`/login/${hash}`).then(res => res.json()).then(data => console.log(data));
}

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = loginForm.querySelectorAll('input');
    const formData = {};
    inputs.forEach(input => {
        formData[input.getAttribute('name')] = input.value;
    });
    fetch('/register', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(data => console.log(data))
})

const transition = () => {
    logo.classList.add('fade-out');
    content.classList.remove('d-none');
    content.classList.add('fade-in');
}

transition();

logo.addEventListener('animationend', e => {
    logo.classList.add('d-none');
})