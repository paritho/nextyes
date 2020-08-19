import {bind, wire} from "hyperhtml";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

const app = q('#app');
const render = bind(app);
render`${wire()`<div>Hello GIA</div>`}`;