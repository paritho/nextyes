export const bringIn = (el) => {
    el.classList.add('fade-in');
    show(el)
}
export const hide = (el) => {
    el.classList.add('d-none');
}
export const seeOut = (el) => {
    el.classList.add('fade-out');
    setTimeout(() => {
        hide(el);
    });
}
export const show = (el) => {
    el.classList.remove('d-none');
}
// direction = left,right, to-left, to-right
export const slide = (direction, el) => {
    //reset
    el.className = "speaker";
    el.classList.add(`slide-${direction}`);
    show(el);
    if(direction === 'left' || direction === "right"){
        setTimeout(()=>{
            hide(el);
        },350)
    }
}

export const transition = (from, to) => {
    seeOut(from);
    bringIn(to);
}
export const wiggle = (el) => {
    if (el.classList.contains('fade-in')) {
        el.classList.remove('fade-in');
    }
    if (el.classList.contains('fade-out')) {
        el.classList.remove('fade-out');
    }
    el.classList.add('wiggle');
    setTimeout(() => {
        el.classList.remove('wiggle');
    }, 2000)
}