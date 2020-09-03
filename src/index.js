
import { bind, wire } from "hyperhtml";

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

const transition = (from, to) => {
    seeOut(from);
    bringIn(to);
}

const bringIn = (el) => {
    el.classList.remove('d-none');
    el.classList.add('fade-in');
}

const seeOut = (el) => {
    el.classList.add('fade-out');
    setTimeout(() => {
        el.classList.add('d-none');
    });
}

const wiggle = (el) => {
    if (el.classList.contains('fade-in')) {
        el.classList.remove('fade-in');
    }
    if (el.classList.contains('fade-out')) {
        el.classList.remove('fade-out');
    }
    el.classList.add('wiggle');
    setTimeout(() => {
        el.classList.remove('wiggle');
    }, 2000)
}

const getCookieValue = (name) => {
    if (!document.cookie) {
        return;
    }
    const cookies = document.cookie.split(';');
    const keyvalpairs = cookies.map(cookie => {
        const [cookieName, value] = cookie.split('=');
        return { name: cookieName.trim(), value };
    });
    const cookie = keyvalpairs.find(pair => pair.name === name);
    if (cookie) {
        return cookie.value;
    }
};

const checkRegistration = () => {
    const hash = getCookieValue('user');
    // user cookie exists
    if (hash) {
        return fetch(`/cookieSignon/${hash}`)
            .catch(err => {
                rej({ error: 'fetch failed', err });
            });
    }
    // no cookie, signin/signup
    return new Promise((res, rej) => {
        rej({ noop: 1 })
    });
}
const renderForm = bind(formWrap);
const forms = {
    signup: wire()` <form action="/signup">
        <div class="form-group">
            <label for="firstName">first name</label>
            <input type="text" name="firstName" class="form-control" id="firstName">
        </div>
        <div class="form-group">
            <label for="lastName">last name</label>
            <input type="text" name="lastName" class="form-control" id="lastName">
        </div>
        <div class="form-group">
            <label for="email">email</label>
            <input type="email" name="email" class="form-control" id="email" aria-describedby="emailHelp">
            <small id="emailHelp" class="form-text">We'll never share your email with anyone
                else.</small>
        </div>
        <div class="form-group">
            <label for="password">password</label>
            <input type="password" name="password" class="form-control" id="password">
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
            <input type="email" name="email" class="form-control" id="email" aria-describedby="emailHelp">
            <small id="emailHelp" class="form-text">We'll never share your email with anyone
                else.</small>
            </div>
            <div class="form-group">
            <label for="password">password</label>
            <input type="password" name="password" class="form-control" id="password">
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

backBtns.addEventListener('click', e => {
    const lookup = {
        "/": 1,
        "":1,
        "/index": 1,
        "index.html": 1
    }
    if (lookup[location.pathname]) {
        seeOut(formWrap);
        renderForm``;
        bringIn(actions);
    } else {
        history.go(-1)
    }
})

actions.addEventListener('click', e => {
    e.preventDefault();
    const btn = e.target.dataset ? e.target.dataset.type : null;
    let form;
    if (!btn) {
        return;
    }
    form = forms[btn];
    renderForm`${form}`;

    seeOut(actions);
    bringIn(menuBtns);
    bringIn(formWrap);
})

formWrap.addEventListener('submit', e => {
    e.preventDefault();
    const goWhere = formWrap.querySelector(['form']).getAttribute('action');
    const inputs = formWrap.querySelectorAll('input');
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
        if (result.dupemail) {
            //message about email
        }
        console.log(result);
        wiggle(formWrap)

    }).catch(e => {
        console.log(e);
    });
})


