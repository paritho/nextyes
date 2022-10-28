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
  if(path === "nextyes"){
    const content = wire()`
      <p>We're glad you're here! We know God has a lot in store for you, and we're praying you download all of it.</p>
      <p>The Next Yes is all about what question God is asking you to say "yes" to. Our faith journey is never complete, there is always another "yes" to answer.</p>
      <p>Let God work in your heart as you consider where He is leading you on your journey.</p>`
    const modal = createModal("the next yes", content);
    modal.open();
    return;
  }
  window.location.href = path;
});

scroller(btns);
