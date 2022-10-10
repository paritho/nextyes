import { bind, wire } from "hyperhtml";
import * as Anim from "./animations.js";
import { checkRegistration } from "./loginUtils.js";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const logo = q(".logo");
const actions = q(".actions");
const content = q(".content");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/worker").then((reg) => {
      console.log("Service worker registered.", reg);
    });
  });
}

let displayMode = "browser tab";
window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.standalone ||
    window.matchMedia("(display-mode: standalone)").matches
  ) {
    displayMode = "standalone";
  }
});

let backBtns;
renderMenu()
  .then(([backBtns, contact, installBtn]) => {
    backBtns.addEventListener("click", (e) => {
      const formWrap = q(".forms");
      Anim.hide(formWrap);
      Anim.bringIn(actions);
      Anim.hide(backBtns);
    });

    if (displayMode !== "standalone") {
      let install = "";
      window.addEventListener("beforeinstallprompt", (e) => {
        install = e;
        installBtn.classList.remove("d-none");
      });

      window.addEventListener("appinstalled", (e) => {
        // logging?
        window.location.reload(false);
      });

      installBtn.addEventListener("click", (e) => {
        install.prompt();
      });
    }
    const details = q(".details");
    const close = q(".close-icon");
    close.addEventListener("click", (e) => {
      Anim.hide(details);
    });
    actions.addEventListener("click", (e) => {
      e.preventDefault();
      const btn = e.target.dataset ? e.target.dataset.type : null;
      let form;
      if (!btn) {
        return;
      }
      
      if (btn === "help") {
        Anim.show(details);
        return;
      }
      renderForm(btn).then((formWrap) => {
        Anim.show(backBtns);
        Anim.seeOut(actions);
        Anim.bringIn(formWrap);
      });
    });
  })
  .catch((e) => console.log(e));

checkRegistration()
  .then((res) => res.json())
  .then((result) => {
    //user exists
    if (result.success) {
      Alerts.showAlert("success", "Welcome!");
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    }
  })
  .catch((err) => {
    Anim.transition(logo, content);
    Anim.bringIn(actions);
  });
