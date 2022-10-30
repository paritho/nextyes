import { bind, wire } from "hyperhtml";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import { createModal } from "./modal.js";
import { on, q, qa, scroller } from "./utils.js"
import * as Anim from "./animations.js";

// get the page we're on, minus the /
const path = window.location.pathname.slice(1);

renderMenu();

if (path === "contact") {
    const whichForm = window.location.search === "?mmd" ? "makemyday" : path
    renderForm(whichForm).then(formWrap => {
        Anim.bringIn(formWrap);
        const helpBtn = q('.help-icon');
        const content = {
            "contact":wire()`<p>Something went wrong? Please find a conference volunteer</p><p>Otherwise, please try again later!</p>`,
            "makemyday":wire()`<p>Make my Day is a fun way for us to bless you today. Dream big!</p><br/><p>Something didn't work right? Please find a 
            conference volunteer, or try again later.</p>`
        }
        const modal = createModal('help with messages', content[whichForm])
        on(helpBtn, 'click', (e) => modal.open())
    })
}

if (path === 'schedule') {
    const schedule = q('.schedule-content');
    let scheduleData = {};
    (async () => {
        const res = await fetch('./data/schedule.json').catch(e => console.error(e));
        scheduleData = await res.json();
        bind(schedule)`${scheduleData.map(item => {
            return wire()`<div class="row sched-row row-border" data-sessid="${item.id}">
                    <div class="col-3 row-title">${item.time}</div>
                    <div class="col-9 row-text">${item.title}</div>
                </div>`
        })}`

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
        const footer = sessionDetails.notes ? wire()`<button class="btn btn-primary" href='/notes'">take notes</button>` : "";
        const modal = createModal(sessionDetails.title, wire()`${{html:sessionDetails.descr}}`, footer)
        modal.open();
    })
}

if(path === "leaderboard"){
    const lb = q('.lb-content');
    const colorMap = {
        0: "",
        1: "",
        2: ""
    }
    const whichPlace = (idx) => {
        if(idx > 2) {
            return;
        }
        return wire()`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="${colorMap[idx]}" class="help-icon left">
        <path
        d="M28.6 29.4c3-2.3 7.4-5.7 7.4-18.4v-1H14v1c0 12.7 4.5 16.1 7.4 18.4 1.7 1.3 2.6 2 2.6 3.6v3c-1.6.2-3.2.8-3.8 2H18c-1.1 0-2 .9-2 2h18c0-1.1-.9-2-2-2h-2.2c-.6-1.2-2.1-1.8-3.8-2v-3c0-1.6.8-2.3 2.6-3.6zm-3.6.5c-.6-.8-1.5-1.5-2.3-2.1-2.7-2.1-6.4-4.9-6.6-15.8h18c-.2 10.8-3.9 13.7-6.6 15.8-1 .7-1.9 1.3-2.5 2.1z" />
        <path d="M18.8 27C18.7 27 8 24.7 8 13v-1h7v2h-5c.6 9.2 9.1 11 9.2 11l-.4 2z" />
        <path d="M31.2 27l-.4-2c.4-.1 8.6-1.9 9.2-11h-5v-2h7v1c0 11.7-10.7 14-10.8 14z" />
    </svg>`
    }
    
    let lbData = {};
    (async () => {
        const res = await fetch('./leaders').catch(e => console.error(e));
        lbData = await res.json();
        lbData.sort((a, b) => a.score - b.score)
        bind(lb)`${lbData.map((item, idx) => {
            return wire()`<div class="row row-border" data-sessid="${item.id}">
                    <div class="col-12 lb-row">
                        ${whichPlace(idx)}
                        <span class="score">${item.score}</span>
                        <span class="name">${item.name}</span>
                    </div>
                </div>`
        })}`

    })();
}

const scrollBtn = q(`.${path}`);
if(scrollBtn){
    scroller(scrollBtn, 20);
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

