import { bind, wire } from "hyperhtml";
import * as Anim from "./animations.js";
import { renderMenu } from "./menu.js";
import * as Alerts from "./alerts.js";
import { createModal } from "./modal.js";
import { on, q, qa } from "./utils.js";

const formWrap = q(".forms");
const form = q("form");
const adminWrap = q(".admin");

renderMenu().catch((e) => console.log(e));

const myfetch = (where, method, type, body) => {
  return fetch(where, {
    method,
    headers: {
      Accept: type,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => {
    if (!res.ok) {
      throw new Error("unauthorized");
    }
    return type == "text/html" ? res.text() : res.json();
  });
};

on(form, "submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const goWhere = form.getAttribute("action");
  const inputs = form.querySelectorAll("input");

  const formData = {};
  inputs.forEach((input) => {
    formData[input.getAttribute("name").trim()] = input.value;
  });
  fetch(goWhere, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => {
      return res.json();
    })
    .then((result) => {
      if (result.failed) {
        Alerts.showAlert("danger", result.failed);
        setTimeout(() => {
          Alerts.hideAlert();
        }, 2500);
        return;
      }

      myfetch("/adminContent", "POST", "text/html", {
        authToken: result.authToken,
      })
        .then((html) => {
          Alerts.showAlert("success", "Welcome, Overlord");
          setTimeout(() => {
            Alerts.hideAlert();
          }, 1500);
          Anim.hide(formWrap);
          // bind, wire result
          bind(adminWrap)`${{ html }}`;
          Anim.bringIn(adminWrap);
        })
        .then(() => setupContent(result.authToken))
        .catch((error) => {
          throw error;
        });
    })
    .catch((e) => {
      console.error("There was an internal error");
      //   window.location.href = "/admin";
    });
});

// all dom elements should be here when this is called
const setupContent = (token) => {
  const findUserBtn = q(".findUser");
  const findUserForm = q("form.user-search");
  const winnersBtn = q(".winners");
  const stats = q(".stats");

  const inputs = qa('.user-search input[name]');

  let modal = "";
  let modalContent = "";

  myfetch('/stats', "POST", "application/json", {authToken: token})
    .then(data => {
        const content = wire()`<div class="row">
            <div class="col-7">Users:</div>
            <div class="col-5">${data.totalUsers}</div>
            <div class="col-7">Trivia Players:</div>
            <div class="col-5">${data.triviaUsers}</div>
            <div class="col-7">Page Views:</div>
            <div class="col-5">${data.views}</div>
        </div>`
        bind(stats)`${content}`
    })
    .catch((error) => console.error);

  on(findUserBtn, "click", (event) => {
    const body = {
      authToken: token
    };

    inputs.forEach(input => body[input.getAttribute('name').trim()] = input.value)

    myfetch("/findUser", "POST", "application/json", body)
      .then((data) => {
        console.log(data)
        modalContent = wire()`<ul>${data.map(
          (item) => wire()`<li>${item.firstName} ${item.lastName}<br/>${item.email}<br/> ${item.lastLogon}  </li>`
        )}</ul>`;
        modal = createModal("search results", modalContent);
        modal.open();
      })
      .catch((error) => console.error);
  });

  on(winnersBtn, "click", (event) => {
    myfetch("/winners", "POST", "application/json", {authToken: token})
      .then((data) => {
        modalContent = wire()`<ul>${data.map(
          (item) => wire()`<li>${item.score} - ${item.name}</li>`
        )}</ul>`;
        modal = createModal("trivia winners", modalContent);
        modal.open();
      })
      .catch((error) => console.error);
  });
};
