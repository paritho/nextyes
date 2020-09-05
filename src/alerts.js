import { bind, wire } from "hyperhtml";
const q = (selector) => document.querySelector(selector);

export const showAlert = (msg) => {
    const alerts = q('.alerts');
    const renderAlert = bind(alerts);
    const alert = wire()`<p class="msg">${msg}</p>`;
    renderAlert`${alert}`;
    alerts.classList.remove('hide');
    alerts.classList.add('show');
    alerts.classList.remove('d-none');
}

export const hideAlert = () => {
    const alerts = q('.alerts');
    alerts.classList.remove('show');
    alerts.classList.add('hide');
    setTimeout(()=>{
        alerts.classList.add('d-none');
    },1500)
}