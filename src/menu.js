import { bind, wire } from "hyperhtml";
import { transition, bringIn, seeOut, wiggle } from "./animations.js";

const q = (selector) => document.querySelector(selector);

export const renderMenu = () => {
    const menu = q('.menu');
    let menuContent;
    if(menu){
        menuContent = wire()`<div>
            <div class="menu-btns">
                <div class="back-btns d-none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white">
                        <path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white">
                        <path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z" />
                    </svg>
                </div>
                <svg class="contact d-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white">
                    <path opacity=".9" d="M31.796 24.244l9.97 9.97-1.415 1.414-9.97-9.97z" />
                    <path opacity=".9" d="M18.278 24.287l1.414 1.414-9.9 9.9-1.414-1.41z" />
                    <path
                        d="M25 29.9c-1.5 0-3.1-.6-4.2-1.8L8.3 15.7l1.4-1.4 12.5 12.5c1.6 1.6 4.1 1.6 5.7 0l12.5-12.5 1.4 1.4-12.6 12.5c-1.1 1.1-2.7 1.7-4.2 1.7z" />
                    <path
                        d="M39 38H11c-1.7 0-3-1.3-3-3V15c0-1.7 1.3-3 3-3h28c1.7 0 3 1.3 3 3v20c0 1.7-1.3 3-3 3zM11 14c-.6 0-1 .4-1 1v20c0 .6.4 1 1 1h28c.6 0 1-.4 1-1V15c0-.6-.4-1-1-1H11z" />
                </svg>
            </div>
            <img src="img/logo-small.png" class="menu-logo" />
        </div>`;
        return new Promise((res, rej) => {
            bind(menu)`${menuContent}`;
            res();
        })
    }
}