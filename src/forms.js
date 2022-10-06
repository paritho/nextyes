import { bind, wire } from "hyperhtml";
import * as Anim from "./animations.js";
import { getCookieValue } from "./loginUtils.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
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
        <button type="submit" class="btn btn-primary">let's go!</button>
    </form>`,
    login: wire()`<form action="/signon"> 
        <div class="form-group">
            <label for="email">email</label>
            <input type="email" name="email" required class="form-control" id="email" aria-describedby="emailHelp" placeholder="email">
            <small id="emailHelp" class="form-text">ex: name@gmail.com</small>
        </div>
        <button type="submit" class="btn btn-primary">let's go!</button>
    </form>`,
    contact: wire()`<form>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="#fa9300" class="email-help-icon">
            <path
                d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" />
            <path
                d="M19.8 19.6c.3-.8.6-1.4 1.2-1.9.5-.5 1.1-.9 1.9-1.2s1.6-.4 2.5-.4c.7 0 1.4.1 2 .3.6.2 1.2.5 1.7.9s.9.9 1.1 1.5c.3.6.4 1.3.4 2 0 1-.2 1.8-.6 2.5s-1 1.3-1.6 2l-1.3 1.3c-.3.3-.6.6-.7.9-.2.3-.3.7-.3 1.1-.1.4-.1.7-.1 1.5h-1.6c0-.8 0-1.1.1-1.7.1-.5.3-1 .5-1.5.2-.4.5-.8.9-1.2.4-.4.9-.8 1.4-1.4.5-.5.9-1 1.2-1.5s.5-1.2.5-1.8c0-.5-.1-1-.3-1.4-.2-.4-.5-.8-.8-1.1-.3-.3-.7-.5-1.2-.7-.5-.2-.9-.3-1.4-.3-.7 0-1.3.1-1.8.4-.5.2-1 .6-1.3 1-.3.4-.6.9-.8 1.5s-.4.9-.4 1.6h-1.6c0-.9.1-1.6.4-2.4zM26 32v2h-2v-2h2z" />
        </svg>
        <div class="form-group">
            <input type="text" readonly class="form-control" value="contact us">
            <input type="hidden" name="subject" readonly id="subject" value="New Contact Us">
        </div>
        <div class="form-group">
            <label for="message">questions, feedback, or prayer requests?</label>
            <textarea required name="message" class="form-control msgbody" id="message"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">send message</button>
    </form>`,
    makemyday: wire()`<form>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="#fa9300" class="email-help-icon">
            <path
                d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z" />
            <path
                d="M19.8 19.6c.3-.8.6-1.4 1.2-1.9.5-.5 1.1-.9 1.9-1.2s1.6-.4 2.5-.4c.7 0 1.4.1 2 .3.6.2 1.2.5 1.7.9s.9.9 1.1 1.5c.3.6.4 1.3.4 2 0 1-.2 1.8-.6 2.5s-1 1.3-1.6 2l-1.3 1.3c-.3.3-.6.6-.7.9-.2.3-.3.7-.3 1.1-.1.4-.1.7-.1 1.5h-1.6c0-.8 0-1.1.1-1.7.1-.5.3-1 .5-1.5.2-.4.5-.8.9-1.2.4-.4.9-.8 1.4-1.4.5-.5.9-1 1.2-1.5s.5-1.2.5-1.8c0-.5-.1-1-.3-1.4-.2-.4-.5-.8-.8-1.1-.3-.3-.7-.5-1.2-.7-.5-.2-.9-.3-1.4-.3-.7 0-1.3.1-1.8.4-.5.2-1 .6-1.3 1-.3.4-.6.9-.8 1.5s-.4.9-.4 1.6h-1.6c0-.9.1-1.6.4-2.4zM26 32v2h-2v-2h2z" />
        </svg>
        <div class="form-group">
            <input type="text" tabindex="-1" class="form-control" readonly value="make my day!">
            <input type="hidden" name="subject" id="subject" readonly value="MAKE MY DAY">
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
    // not using password atm
    // if (goWhere === '/signup') {
    //     const password = [...inputs].find(input => input.id === "password");
    //     const confirm = [...inputs].find(input => input.id === "confirm");
    //     if (password.value !== confirm.value) {
    //         Anim.wiggle(form);
    //         confirm.setCustomValidity("Passwords must match");
    //         confirm.classList.add('error');
    //         confirm.reportValidity();
    //         setTimeout(() => {
    //             confirm.setCustomValidity("");
    //         }, 2000)
    //         return;
    //     } else {
    //         confirm.classList.remove('error');
    //     }
    // }

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
    e.preventDefault();
    const form = e.target;
    const inputs = [form.querySelector('input[name]'), form.querySelector('textarea[name]')];
    const formData = {
        hash: getCookieValue('user')
    };
    inputs.forEach(input => {
        formData[input.getAttribute('name').trim()] = input.value;
    });

    Alerts.showAlert("info", "Sending Message...");
    fetch("/sendMessage", {
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
            Alerts.showAlert('success', result.success);
            setTimeout(()=>{
                window.location.href = "/home";
            },1000)
        }
        const failure = result.failed;
        if (failure) {
            Alerts.showAlert("danger", failure);
            setTimeout(() => {
                Alerts.hideAlert();
            }, 2500);
        }
    }).catch(e => {
        console.error('There was an internal error')
    });
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
