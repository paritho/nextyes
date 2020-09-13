import { bind, wire } from "hyperhtml";
import { transition, show, bringIn, seeOut, wiggle } from "./animations.js";
import { renderForm } from "./forms.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

