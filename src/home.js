import { q, on, scroller } from "./utils.js";
import { renderMenu } from "./menu.js";
import { createModal } from "./modal.js"
import { bind, wire } from "hyperhtml";

renderMenu();

const btns = q(".btn-wrap");
on(btns,"click", (e) => {
  const target = e.target;
  const goingto = target.closest("[data-goto]");
  const path = goingto ? goingto.dataset.goto : "#";
  if (path === "#") {
    return;
  }
  window.location.href = path;
});

scroller(btns);
