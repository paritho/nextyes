import { bind, wire } from "hyperhtml";
import { createModal } from "./modal.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";
import { off, on, q, qa } from "./utils.js"

const intro = q('.intro');
const triviaWrap = q('.trivia-wrap');
const qaView = q('.qaView');

const renderQA = bind(qaView);

const shuffle = (array) => {
    const toShuffle = [...array]
    let idx = toShuffle.length -1;
    for (; idx > 0; idx--) {
      const temp = Math.floor(Math.random() * (idx + 1)); 
      [toShuffle[idx], toShuffle[temp]] = [toShuffle[temp], toShuffle[idx]];
    }
    return toShuffle;
}

const select = (event) => {
    qa('.answers li').forEach(item => item.classList.remove('selected'));
    event.target.classList.add('selected')
}

let tData = {};
(async () => {
    const res = await fetch("./data/trivia.json").catch(console.error);
    tData = await res.json();
    tData = shuffle(tData);
    console.log('shuffled tData is: ', tData)
    const firstQa = tData.shift();
    renderQA`<div class="question"><p>${firstQa.question}</p></div>
                    <div class="answers-wrap">
                        <ul class="answers">
                        ${firstQa.answers.map(ans => wire()`<li onclick="${select}">${ans}</li>`)}
                        </ul>
                    </div>`
    
})()

const handler = (event)=>{
    setTimeout(()=>{
        Anim.hide(intro);
        off(intro, 'click', handler)
    }, 250)
    setTimeout(()=>{
        Anim.bringIn(triviaWrap)
    },250)
    
}

on(intro, 'click', handler)


