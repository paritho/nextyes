export const transition = (from, to) => {
    seeOut(from);
    bringIn(to);
}

export const bringIn = (el) => {
    el.classList.remove('d-none');
    el.classList.add('fade-in');
}

export const seeOut = (el) => {
    el.classList.add('fade-out');
    setTimeout(() => {
        el.classList.add('d-none');
    });
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