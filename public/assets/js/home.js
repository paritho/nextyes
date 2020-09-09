const q = (selector) => document.querySelector(selector);

const btns = q('.btn-wrap');
btns.addEventListener('click', e => {
    const target = e.target;
    const goingto = target.closest('[data-goto]');
    const path = goingto ? goingto.dataset.goto : "#";
    if(path == '#'){
        return;
    }
    window.location.href = path;
})