import { bind, wire } from "hyperhtml";
import { transition, show, bringIn, seeOut, wiggle } from "./animations.js";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');

let displayMode = 'browser tab';
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
    }
});

// get the page we're on, minus the /
const path = window.location.pathname.slice(1);

renderMenu().then(([backBtns, contact, installBtn]) => {
    show(backBtns);
    show(contact);
    backBtns.addEventListener('click', e => {
        window.history.go(-1)
    })
    contact.addEventListener('click', e => {
        const currentPage = window.location.pathname;
        window.location.href = `/contact`;
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

if (path === "contact" || path === "makemyday") {
    renderForm(path).then(formWrap => {
        bringIn(formWrap);
    })
}

if (path === 'schedule') {
    const detailWrap = q('.details');
    const detailTitle = q('.details-title');
    const detailsBody = q('.details-body');
    const schedule = q('.schedule');
    const renderDetails = bind(detailWrap);
    let scheduleData = {};
    (async () => {
        const res = await fetch('./js/schedule.json').catch(e => console.error(e));
        scheduleData = await res.json();
    })();
    const close = (e) => {
        detailWrap.classList.add('d-none');
        renderDetails``;
    }

    const makeDetail = (deets) => {
        return wire()`<div>
                <div class="details-header">
                    <span class="details-title">${deets.title}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white" class="details-icon" onclick="${close}">
                        <path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/>
                        <path d="M32.283 16.302l1.414 1.415-15.98 15.98-1.414-1.414z"/>
                        <path d="M17.717 16.302l15.98 15.98-1.414 1.415-15.98-15.98z"/>
                    </svg>
                </div>
                <div class="details-body">
                    ${{html: deets.descr}}
                </div>
        </div>`;
    }

    schedule.addEventListener('click', e => {
        let target = e.target;
        if (!target.dataset.sessid) {
            target = target.parentNode;
        }
        if(!target.dataset.sessid){
            return;
        }
        const session = target.dataset.sessid;
        const sessionDetails = scheduleData[session];
        renderDetails`${makeDetail(sessionDetails)}`;
        detailWrap.classList.remove('d-none');
    })


}

