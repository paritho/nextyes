import { bind, wire } from "hyperhtml";
import { transition, bringIn, seeOut, wiggle } from "./animations.js";
import { checkRegistration } from "./loginUtils.js";
import renderMenu from "./menu.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const app = q('#app');