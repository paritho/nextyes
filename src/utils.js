const q = (selector, el) =>
  el ? el.querySelector(selector) : document.querySelector(selector);
const qa = (selector, el) =>
  el ? el.querySelectorAll(selector) : document.querySelectorAll(selector);

const on = (el, type, callback) => {
  el.addEventListener(type, callback);
};

const off = (el, type, callback) => {
  el.removeEventListener(type, callback);
};

const scroller = (content) => {
  // flip the godown indicator button to a goup indicator if we've scrolled
  const godown = q(".godown");
  const rec = content.getBoundingClientRect();
  on(content,"scroll", (event) => {
    if (!godown) {
      return;
    }

    // if we're at least 20 pixels from the bottom
    if (rec.height + content.scrollTop >= content.scrollHeight - 20) {
      godown.classList.add("flip-to-goup");
    } else {
      godown.classList.remove("flip-to-goup");
    }
  });
};

module.exports = {
  on,
  off,
  q,
  qa,
  scroller
};
