const q = (selector) => document.querySelector(selector);

const btns = q(".btn-wrap");
btns.addEventListener("click", (e) => {
  const target = e.target;
  const goingto = target.closest("[data-goto]");
  const path = goingto ? goingto.dataset.goto : "#";
  if (path == "#") {
    return;
  }
  window.location.href = path;
});

// flip the godown indicator button to a goup indicator if we've scrolled
const godown = q(".godown");
const rec = btns.getBoundingClientRect();
btns.addEventListener("scroll", (event) => {
  if (!godown) {
    return;
  }
  
  // if we're at least 20 pixels from the bottom
  if(rec.height + btns.scrollTop >= btns.scrollHeight - 20){
    console.log("at bottom");
    godown.classList.add("flip-to-goup");
  } else {
    godown.classList.remove("flip-to-goup")
  }
});
