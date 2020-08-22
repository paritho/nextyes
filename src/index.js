import { bind, wire } from "hyperhtml";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
const logo = q('.logo');
const installBtn = q('.install');
const actions = q('.actions');
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
});

const loggedIn = false; // get cookie for reals

const renderActions = bind(actions);
renderActions``;
if(!loggedIn){
    renderActions`${wire()`<form class="login-form">
    <div class="form-group">
        <label for="firstName">first name</label>
        <input type="text" class="form-control" id="firstName">
    </div>
    <div class="form-group">
        <label for="lastName">last name</label>
        <input type="text" class="form-control" id="lastName">
    </div>
    <div class="form-group">
        <label for="email">email</label>
        <input type="email" class="form-control" id="email" aria-describedby="emailHelp">
        <small id="emailHelp" class="form-text">We'll never share your email with anyone
            else.</small>
    </div>
    <button type="submit" class="btn btn-primary loginBtn">login/register</button>
</form>`}`
} else {
    renderActions``;
}


// logo.addEventListener('animationend', e => {
//     logo.classList.add('d-none');
// })

setTimeout(() => {
    // logo.classList.add('fade-out');
    content.classList.remove('d-none');
    content.classList.add('fade-in');
}, 1000);
