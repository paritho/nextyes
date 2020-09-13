
import { bind, wire } from "hyperhtml";
import { transition, show, bringIn, seeOut, wiggle } from "./animations.js";
import { checkRegistration } from "./loginUtils.js";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');
const logo = q('.logo');
const actions = q('.actions');
const content = q('.content');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/worker')
            .then((reg) => {
                console.log('Service worker registered.', reg);
            });
    });
}

let displayMode = 'browser tab';
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
    }
});

let backBtns;
renderMenu().then(([backBtns, contact, installBtn]) => {
    backBtns.addEventListener('click', e => {
        const formWrap = q(".forms");
        seeOut(formWrap);
        bringIn(actions);
        seeOut(backBtns);
    })

    if (displayMode !== "standalone") {
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
            window.location.reload(false);
        });
    }

    actions.addEventListener('click', e => {
        e.preventDefault();
        const btn = e.target.dataset ? e.target.dataset.type : null;
        let form;
        if (!btn) {
            return;
        }
        renderForm(btn).then((formWrap) => {
            show(backBtns);
            seeOut(actions);
            bringIn(formWrap)
        });

    })
}).catch(e => console.log(e));


checkRegistration()
    .then(res => res.json())
    .then(result => {
        //user exists
        if (result.success) {
            window.location.href = "/home";
        }
    }).catch(err => {
        transition(logo, content);
        bringIn(actions);
    });



