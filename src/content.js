import { bind, wire } from "hyperhtml";
import { transition, bringIn, seeOut, wiggle } from "./animations.js";
import { renderMenu } from "./menu.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');

let displayMode = 'browser tab';
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches){
        displayMode = 'standalone';
    }
});

renderMenu().then(([backBtns, contact, installBtn]) => {
        
    bringIn(backBtns);
    bringIn(contact);
    backBtns.addEventListener('click', e => {
        window.history.go(-1)
    })
    contact.addEventListener('click', e => {
        const currentPage = window.location.pathname;
        window.location.href = `/contact?returnto=${currentPage}&type=contact`;
    })

    let install = "";
    if (displayMode !== 'standalone') {
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
})

