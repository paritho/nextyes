import { bind, wire } from "hyperhtml";
import * as Anim from "./animations.js";
import { q } from "./utils.js";

export const createModal = (title, content, footer) => {
    const target = q('.modal-wrap');
    const render = bind(target);
    const close = ()=> Anim.hide(target) && render``;
    const modal = wire()`
        <div class="tny-modal">
            <div class="tny-modal-header">
                <span class="tny-modal-title">${title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white" class="close-icon" onclick=${close}>
                    <path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/>
                    <path d="M32.283 16.302l1.414 1.415-15.98 15.98-1.414-1.414z"/>
                    <path d="M17.717 16.302l15.98 15.98-1.414 1.415-15.98-15.98z"/>
                </svg>
            </div>
            <div class="tny-modal-body">${{html: content}}</div>
            <div class="tny-modal-footer">${{html: footer}}</div>
        </div>`
    return {
        open: () => render`${modal}` && Anim.show(target),
        close
    }
}