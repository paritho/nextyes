import { bind, wire } from "hyperhtml";
import * as Anim from "./animations.js";
import { getCookieValue } from "./loginUtils.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
const cookie = getCookieValue('user');
const formWrap = q('.forms');

const forms = {
    signup: wire()` <form action="/signup">
        <div class="form-group">
            <label for="firstName">first name</label>
            <input type="text" name="firstName" required class="form-control" id="firstName" placeholder="first name">
        </div>
        <div class="form-group">
            <label for="lastName">last name</label>
            <input type="text" name="lastName" required class="form-control" id="lastName" placeholder="last name">
        </div>
        <div class="form-group">
            <label for="email">email</label>
            <input type="email" name="email" required class="form-control" id="email" aria-describedby="emailHelp" placeholder="email">
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
        <button type="submit" class="btn btn-primary">sign up</button>
    </form>`,
    login: wire()`<form action="/signon"> 
        <div class="form-group">
            <label for="email">email</label>
            <input type="email" name="email" required class="form-control" id="email" aria-describedby="emailHelp" placeholder="email">
            <small id="emailHelp" class="form-text">We'll never share your email with anyone
                else.</small>
        </div>
        <div class="form-group">
            <label for="password">password</label>
            <input type="password" required name="password" class="form-control" id="password">
        </div>
        <button type="submit" class="btn btn-primary">sign in</button>
    </form>`,
    contact: wire()`<form action="/sendMessage"> 
        <div class="form-group">
            <input type="text" name="subject" required class="form-control" id="subject" placeholder="subject">
        </div>
        <div class="form-group">
            <label for="message">questions, feedback, or prayer requests?</label>
            <textarea required name="message" class="form-control msgbody" id="message"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">send message</button>
    </form>`,
    makemyday: wire()`<form action="/sendMessage"> 
        <div class="form-group">
            <input type="text" tabindex="-1" name="subject" class="form-control" id="subject" readonly value="make my day">
        </div>
        <div class="form-group">
            <label for="message">what would make your day?</label>
            <textarea required name="message" class="form-control msgbody" id="message"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">make my day!</button>
    </form>`,
    reset:"",
    forgot:wire()`<form action="/forgot"> 
        <label>Enter the email you used to signup. If it's in our system, we'll send you a link to reset your password.</label>
        <div class="form-group">
            <input type="email" name="email" required class="form-control" id="email" aria-describedby="emailHelp" placeholder="email">
        </div>  
        <button type="submit" class="btn btn-primary">submit</button>
    </form>`,
};

const loginListener = e => {
    e.preventDefault();
    const form = e.target;
    const goWhere = form.getAttribute('action');
    const inputs = form.querySelectorAll('input');
    if (goWhere === '/signup') {
        const password = [...inputs].find(input => input.id === "password");
        const confirm = [...inputs].find(input => input.id === "confirm");
        if (password.value !== confirm.value) {
            Anim.wiggle(form);
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
            Alerts.showAlert("danger", failure);
            setTimeout(() => {
                Alerts.hideAlert();
            }, 2500);
            Anim.wiggle(form)
        }

    }).catch(e => {
        console.error('There was an internal error')
    });
}

const emailListener = e => {

}

const listenTypes = {
    signup: loginListener,
    login: loginListener,
    contact: emailListener,
    makemyday: emailListener,
    reset:()=>{},
    forgot:()=>{}
}

export const renderForm = (type, listener) => {
    return new Promise((res, rej) => {
        if (formWrap && forms[type]) {
            bind(formWrap)`${forms[type]}`;
            if(listener && typeof listener === 'function'){
                formWrap.addEventListener('submit', listener);
            } else if(listener !== false){
                formWrap.addEventListener('submit', listenTypes[type])
            }
            res(formWrap);
        } else {
            rej();
        }
    })
}
