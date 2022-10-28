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
    console.log('leaderboard')
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

    scroller(q('.speakers'))

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
