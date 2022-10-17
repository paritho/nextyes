import { bind, wire } from "hyperhtml";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import { createModal } from "./modal.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";
import { on, q, qa } from "./utils.js"

const app = q('#app');

// get the page we're on, minus the /
const path = window.location.pathname.slice(1);

renderMenu()
  .then(([backBtns, contact]) => {
    Anim.show(backBtns);
    Anim.show(contact);
    on(backBtns,'click', e => {
        if(window.location.pathname !== "/home"){
            window.history.go(-1);
        }
    })
    on(contact, 'click', e => {
        window.location.href = `/contact`;
    })
})

if (path === "contact") {
    const whichForm = window.location.search === "?mmd" ? "makemyday" : path
    renderForm(whichForm).then(formWrap => {
        Anim.bringIn(formWrap);
        const helpBtn = q('.help-icon');
        const content = {
            "contact":``,
            "makemyday":``
        }
        const modal = createModal('help with messages', content[path])
        on(helpBtn, 'click', (e) => modal.open())
    })
}

if (path === 'schedule') {
    const schedule = q('.schedule');
    let scheduleData = {};
    (async () => {
        const res = await fetch('./data/schedule.json').catch(e => console.error(e));
        scheduleData = await res.json();
    })();

    on(schedule, 'click', e => {     
        let target = e.target;
        if (!target.dataset.sessid) {
            target = target.parentNode;
        }
        if(!target.dataset.sessid){
            return;
        }
        const session = target.dataset.sessid;
        const sessionDetails = scheduleData[session];
        const footer = sessionDetails.notes ? `<a class="btn btn-primary" href='/notes'">take notes</a>` : "";
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

    on(goright, 'click', e => {
        const showing = currSpeaker;
        currSpeaker = currSpeaker === numSpeakers ? 0 : currSpeaker + 1;
        Anim.slide('left', speakerCards[showing]);
        Anim.slide('to-left', speakerCards[currSpeaker]);
        Anim.show(speakerCards[currSpeaker]);
    })

    on(goleft, 'click', e => {
        const showing = currSpeaker;
        currSpeaker = currSpeaker === 0 ? numSpeakers : currSpeaker - 1;
        Anim.slide('right', speakerCards[showing]);
        Anim.slide('to-right', speakerCards[currSpeaker]);
        Anim.show(speakerCards[currSpeaker]);
    })

}
