import { bind, wire } from "hyperhtml";
import { renderForm } from "./forms.js";
import { renderMenu } from "./menu.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

const newNote = q('.newNote');
const noteWrap = q('.notes');
newNote.addEventListener('click', e =>{
    Anim.seeOut(noteWrap)
    const makeNewNote = e=> {
        e.preventDefault();
        console.log(e);
    };
    renderForm("notes", makeNewNote).then(formWrap => Anim.bringIn(formWrap));
})