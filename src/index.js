import { bind, wire } from "hyperhtml";
import * as Anim from "./animations.js";
import { checkRegistration } from "./loginUtils.js";
import { renderMenu } from "./menu.js";
import { renderForm } from "./forms.js";
import * as Alerts from "./alerts.js";
import { createModal } from "./modal.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);
const logo = q(".logo");
const actions = q(".actions");
const content = q(".content");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/worker").then((reg) => {
      console.log("[Service Worker] Registered.");
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
    
    const modalContent = `<p>Welcome to The Next Yes conference app! We hope you have a great experience with us.</p>
    <p>To sign up, we just need your name and email; we'll never sell nor disclose either.</p>
    <p>Installing the app is easy - if you're on an Android device, press the install button and follow the prompts. For iOS, follow these steps:</p>
    <ul>
        <li>1. Open thenextyes.app in Safari</li>
        <li>2. Press the Send button</li>
        <li>3. Select Save to Home Screen</li>
    </ul>`;
    const modal = createModal("get help", modalContent)
    actions.addEventListener("click", (e) => {
      e.preventDefault();
      const btn = e.target.dataset ? e.target.dataset.type : null;
      let form;
      if (!btn) {
        return;
      }
      
      if (btn === "help") {
        modal.open()
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
