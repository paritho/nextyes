// import { wire } from hyperHtml;
import { transition, bringIn, seeOut, wiggle } from "./animations.js";

const q = (selector) => document.querySelector(selector);

const back = (btn) => {
    btn.addEventListener('click', e => {
        const lookup = {
            "/": 1,
            "": 1,
            "/index": 1,
            "index.html": 1
        }
        if (lookup[location.pathname]) {
            seeOut(q('.forms'));
            bringIn(q('.actions'));
            seeOut(q('.back-btns'));
        } else {
            history.go(-1)
        }
    })
}

export default { back }
