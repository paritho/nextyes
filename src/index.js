
import { bind, wire } from "hyperhtml";
import { transition, bringIn, seeOut, wiggle } from "./animations.js";
import { checkRegistration } from "./loginUtils.js";
import menuListeners from "./menu.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
const logo = q('.logo');
const installBtn = q('.install');
const formWrap = q('.forms');
const menuBtns = q('.menu-btns');
const backBtns = q('.back-btns');
const contact = q('.contact');
const actions = q('.actions');
const content = q('.content');

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

const renderForm = bind(formWrap);
menuListeners.back(backBtns);

const forms = {
    signup: wire()` <form action="/signup">
        <div class="form-group">
            <label for="firstName">first name</label>
            <input type="text" name="firstName" required class="form-control" id="firstName">
        </div>
        <div class="form-group">
            <label for="lastName">last name</label>
            <input type="text" name="lastName" required class="form-control" id="lastName">
        </div>
        <div class="form-group">
            <label for="email">email</label>
            <input type="email" name="email" required class="form-control" id="email" aria-describedby="emailHelp">
            <small id="emailHelp" class="form-text">We'll never share your email with anyone
                else.</small>
        </div>
        <div class="form-group">
            <label for="password">password</label>
            <input type="password" name="password" required class="form-control" id="password">
        </div>
        <div class="form-group">
            <label for="password">confirm password</label>
            <input type="password" class="form-control" id="confirm">
        </div>
        <button type="submit" class="btn btn-primary loginBtn">sign up</button>
    </form>`,
    login: wire()`<form action="/signon"> 
        <div class="form-group">
            <label for="email">email</label>
            <input type="email" name="email" required class="form-control" id="email" aria-describedby="emailHelp">
            <small id="emailHelp" class="form-text">We'll never share your email with anyone
                else.</small>
            </div>
            <div class="form-group">
            <label for="password">password</label>
            <input type="password" required name="password" class="form-control" id="password">
        </div>
        <button type="submit" class="btn btn-primary loginBtn">sign in</button>
    </form>`
};

checkRegistration()
    .then(res => res.json())
    .then(result => {
        //user exists
        if (result.success) {
            location.href = "/home";
        }
    }).catch(err => {
        transition(logo, content);
        bringIn(actions);
    });

actions.addEventListener('click', e => {
    e.preventDefault();
    const btn = e.target.dataset ? e.target.dataset.type : null;
    let form;
    if (!btn) {
        return;
    }
    renderForm``;
    form = forms[btn];
    renderForm`${form}`;

    seeOut(actions);
    bringIn(backBtns);
    bringIn(formWrap);
})



formWrap.addEventListener('submit', e => {
    e.preventDefault();
    const goWhere = formWrap.querySelector(['form']).getAttribute('action');
    const inputs = formWrap.querySelectorAll('input');
    let invalid = false;
    if (goWhere === '/signup') {
        debugger
        const password = [...inputs].find(input => input.id === "password");
        const confirm = [...inputs].find(input => input.id === "confirm");
        if (password.value !== confirm.value) {
            wiggle(formWrap);
            confirm.setCustomValidity("Passwords must match");
            confirm.classList.add('error');
            confirm.reportValidity();
            setTimeout(() => {
                confirm.setCustomValidity("");
            }, 2000)
            return;
        } else {
            confirm.classList.remove('error');
        }
    }

    const formData = {};
    inputs.forEach(input => {
        if (input.id == "confirm") {
            return;
        }
        formData[input.getAttribute('name').trim()] = input.value;
    });
    fetch(goWhere, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(res => {
        return res.json();
    }).then(result => {
        if (result.success) {
            location.href = "/home";
        }
        const failure = result.dupemail || result.failed;
        if (failure) {
            Alerts.showAlert(failure);
            setTimeout(() => {
                Alerts.hideAlert();
            }, 1500);
            wiggle(formWrap)
        }

    }).catch(e => {
        console.log(e);
    });
})


