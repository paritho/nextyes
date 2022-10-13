import { bind, wire } from "hyperhtml";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import { createModal } from "./modal.js";
import * as Anim from "./animations.js";
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
    Anim.show(backBtns);
    Anim.show(contact);
    backBtns.addEventListener('click', e => {
        if(window.location.pathname !== "/home"){
            window.history.go(-1);
        }
    })
    contact.addEventListener('click', e => {
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
            window.location.reload(false);
        })

        installBtn.addEventListener('click', e => {
            install.prompt();
        });
    }
})

if (path === "contact" || path === "makemyday") {
    renderForm(path).then(formWrap => {
        Anim.bringIn(formWrap);
    })
}

if (path === 'schedule') {
    const schedule = q('.schedule');
    let scheduleData = {};
    (async () => {
        const res = await fetch('./js/schedule.json').catch(e => console.error(e));
        scheduleData = await res.json();
    })();

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
        const footer = sessionDetails.notes ? `<button class="btn btn-primary" onclick="window.location.href = '/notes'">notes</button>` : "";
        const modal = createModal(sessionDetails.title, sessionDetails.descr, footer)
        modal.open();
    })


}

if(path === "speakers"){
    const speakerCards = qa(".speaker");
    const numSpeakers = speakerCards.length - 1;
    const goleft = q('.goleft');
    const goright = q('.goright');
    let currSpeaker = 0;

    Anim.bringIn(goleft);
    Anim.bringIn(goright);
    Anim.show(speakerCards[currSpeaker]);

    goright.addEventListener('click', e => {
        const showing = currSpeaker;
        currSpeaker = currSpeaker === numSpeakers ? 0 : currSpeaker + 1;

        Anim.slide('left', speakerCards[showing]);
        Anim.slide('to-left', speakerCards[currSpeaker]);
        Anim.show(speakerCards[currSpeaker]);
    })

    goleft.addEventListener('click', e => {
        const showing = currSpeaker;
        currSpeaker = currSpeaker === 0 ? numSpeakers : currSpeaker - 1;

        Anim.slide('right', speakerCards[showing]);
        Anim.slide('to-right', speakerCards[currSpeaker]);
        Anim.show(speakerCards[currSpeaker]);
    })



}
