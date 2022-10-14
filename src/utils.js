const q = (selector, el) => el ? el.querySelector(selector) : document.querySelector(selector);
const qa = (selector, el) => el ? el.querySelectorAll(selector) : document.querySelectorAll(selector);

const on = (el, type, callback) => {
  el.addEventListener(type, callback);
};

const off = (el, type, callback) => {
  el.removeEventListener(type, callback);
};

module.exports = {
  on,
  off,
  q,
  qa
};
