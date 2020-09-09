import { bind, wire } from "hyperhtml";
const q = (selector) => document.querySelector(selector);

export const showAlert = (type, msg) => {
    const alerts = q('.alerts');
    const renderAlert = bind(alerts);
    const alert = wire()`<p class="msg">${msg}</p>`;
    renderAlert`${alert}`;
    alerts.classList.add(`${type}`);
    alerts.classList.remove('hide');
    alerts.classList.add('show');
    alerts.classList.remove('d-none');
}

export const hideAlert = () => {
    const alerts = q('.alerts');
    alerts.classList.add('hide');
    alerts.classList.remove('success');
    alerts.classList.remove('danger');
    alerts.classList.remove('show');
    setTimeout(()=>{
        alerts.classList.add('d-none');
    });
}