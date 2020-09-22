import { bind, wire } from "hyperhtml";
import { renderForm } from "./forms.js";
import { renderMenu } from "./menu.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";

const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

const newNote = q('.note');
const newNoteBtn = q('.newNote');
const noteList = q('.noteList');
const noteWrap = q('.noteWrap');
const saveNoteBtn = q('.noteDone');

const existingNotes = window.localStorage.getItem('noteids');
if (!existingNotes || !existingNotes.length) {
    window.localStorage.setItem('noteids', JSON.stringify([-1]))
}
const renderIcon = (type, id) => {
    if(type === 'add'){
        return wire()`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white" class="note-icon rotate45" data-noteid="${id}" data-type="${type}">
                <path d="M32.283 16.302l1.414 1.415-15.98 15.98-1.414-1.414z"/>
                <path d="M17.717 16.302l15.98 15.98-1.414 1.415-15.98-15.98z"/>
            </svg>`
    }
    if (type === 'close') {
        return wire()`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white" class="note-icon" data-noteid="${id}" data-type="${type}">
                <path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/>
                <path d="M32.283 16.302l1.414 1.415-15.98 15.98-1.414-1.414z"/>
                <path d="M17.717 16.302l15.98 15.98-1.414 1.415-15.98-15.98z"/>
            </svg>`
    }
    if (type === 'edit') {
        return wire()`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white" class="note-icon" data-noteid="${id}" data-type="${type}">
                <path d="M9.6 40.4l2.5-9.9L27 15.6l7.4 7.4-14.9 14.9-9.9 2.5zm4.3-8.9l-1.5 6.1 6.1-1.5L31.6 23 27 18.4 13.9 31.5z" />
                <path d="M17.8 37.3c-.6-2.5-2.6-4.5-5.1-5.1l.5-1.9c3.2.8 5.7 3.3 6.5 6.5l-1.9.5z" />
                <path d="M29.298 19.287l1.414 1.414-13.01 13.02-1.414-1.41z" />
                <path d="M11 39l2.9-.7c-.3-1.1-1.1-1.9-2.2-2.2L11 39z" />
                <path d="M35 22.4L27.6 15l3-3 .5.1c3.6.5 6.4 3.3 6.9 6.9l.1.5-3.1 2.9zM30.4 15l4.6 4.6.9-.9c-.5-2.3-2.3-4.1-4.6-4.6l-.9.9z" />
            </svg>`
    }
}
const noteRow = (note) => wire()`<div>
        <div class="row note-row row-border">
            <div class=${`note-title ${note.id == -1 ? 'col-11' : 'col-10'}`}>
                <p>${note.title}</p>
            </div>
            <div class="col-1 ${note.id == -1 ? '' : 'note-margin'}">
                ${note.id == -1 ? renderIcon('add', note.id) : renderIcon('edit', note.id)}
            </div>
            <div class=${`col-1 ${note.id == -1 ? 'd-none' : ''}`}>
                ${renderIcon('close', note.id)}
            </div>
        </div>
    </div>`;

noteList.addEventListener('click', e => {
    let icon = e.target;
    if(!icon.classList.contains('note-icon')){
        if(icon.parentNode.classList.contains('note-icon')){
            //for if click happened on path of svg
            icon = icon.parentNode;
        } else {
            return;
        }
    }
    const type = icon.dataset.type;
    const id = icon.dataset.noteid;
    if (type === 'add') {
            Anim.seeOut(noteWrap)
            Anim.show(newNote);

            const idinput = q('#noteid');
            let id = getNextNoteId();
            idinput.value = id;
            q('#title').focus();
            return;
    }
    //existing note
    if(type === 'edit'){
        Anim.seeOut(noteWrap);

        const note = getNote(id);
        q('#noteid').value = note.id;
        q('#title').value = JSON.parse(note.title);
        q('#note').textContent = JSON.parse(note.body);

        Anim.show(newNote);
    }
    // delete note
    if(type === 'close'){
        //confirm?
        deleteNote(id);
        Alerts.showAlert('success', "Note Deleted")
        renderNotes();
        setTimeout(() => {
            Alerts.hideAlert();
        }, 1500)
    }
})

const getNote = (id) => {
    const title = window.localStorage.getItem(`title-${id}`);
    const body = window.localStorage.getItem(`body-${id}`);
    if (title && body) {
        return {
            id,
            title,
            body
        }
    }
    return {
        id: -1,
        title: `add new note`
    };
}
const getAllIds = () => JSON.parse(window.localStorage.getItem('noteids'));
const getNextNoteId = () => {
    const ids = getAllIds();
    // localStorage.noteids starts with element 0 == -1
    if (ids.length === 1 && ids[0] === -1) {
        return 1;
    }
    return +ids[ids.length - 1] + 1;
}
const setNote = (title, body, id) => {
    const ids = getAllIds();
    window.localStorage.setItem(`title-${id}`, JSON.stringify(title));
    window.localStorage.setItem(`body-${id}`, JSON.stringify(body));
    if (ids.includes(id)) {
        return;
    } else {
        ids.push(id);
        window.localStorage.setItem('noteids', JSON.stringify(ids));
    }
}
const deleteNote = (id) => {
    const ids = getAllIds();
    const newIds = ids.filter(noteid => noteid != id);
    window.localStorage.removeItem(`title-${id}`);
    window.localStorage.removeItem(`body-${id}`);
    window.localStorage.setItem('noteids', JSON.stringify(newIds));
}

const renderNotes = () => {
    bind(noteList)`${getAllIds().map(id => noteRow(getNote(id)))}`
}
renderNotes();

saveNoteBtn.addEventListener('click', e => {
    const idInput = newNote.querySelector('#noteid');
    const titleInput = newNote.querySelector('#title');
    const bodyInput = newNote.querySelector('#note');

    const id = idInput.value;
    const title = titleInput.value;
    const body = bodyInput.textContent;

    if (!title || !body) {
        titleInput.value = "";
        bodyInput.textContent = "";
        Anim.hide(newNote);
        Anim.bringIn(noteWrap);
        return;
    }

    setNote(title, body, id);
    Alerts.showAlert('success', "Note Saved!");
    Anim.hide(newNote)
    renderNotes();
    Anim.bringIn(noteWrap);
    setTimeout(() => {
        Alerts.hideAlert();
        titleInput.value = "";
        bodyInput.textContent = "";
    }, 1750)

})