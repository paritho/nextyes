import { bind, wire } from "hyperhtml";
import { renderForm } from "./forms.js";
import { renderMenu } from "./menu.js";
import { createModal } from "./modal.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";
import { q, qa } from "./utils.js";

const existingNotes = window.localStorage.getItem("noteids");
if (!existingNotes || !existingNotes.length) {
  window.localStorage.setItem("noteids", JSON.stringify([-1]));
}

const newNote = q(".note");
const newNoteBtn = q(".newNote");
const noteList = q(".noteList");
const noteWrap = q(".noteWrap");
const saveNoteBtn = q(".noteDone");
const bg = q(".note-dialog-bg");
const noteHelp = q('.help-icon');

const modalContent = ` <ul>
<li>To add a new note, press the 'add a new note' item.</li>
<li>To edit an existing note, press anywhere on the title in the list view.</li>
<li>To remove a note, press the red X icon twice.</li>
</ul>
<p>Please be aware that your notes are stored locally, on your device. This means your notes are private, 
but it also means there is no backup. If you lose this device, or clear your browser history, you will lose your notes.</p>
`;
const modal = createModal("help with notes", modalContent);

on(noteHelp, 'click', modal.open)


on(bg, "click", (e) => {
  e.stopImmediatePropagation();
  e.stopPropagation();
  const dialog = q(".note-confirm-delete.open");
  dialog.classList.remove("open");
  const icon = q(".note-delete");
  icon.dataset.confirm = -1;
  icon.classList.remove("note-delete");
  Anim.hide(dialog);
  Anim.hide(bg);
});

const noteHandler = (e) => {
  let target = e.target;
  if (!target.dataset.noteid) {
    target = target.closest(".note-row[data-noteid]");
  }
  const id = target && target.dataset.noteid;
  if (id != null || id != undefined) {
    if (id == -1) {
      Anim.seeOut(noteWrap);
      Anim.show(newNote);

      const idinput = q("#noteid");
      let id = getNextNoteId();
      idinput.value = id;
      q("#title").focus();
      return;
    }

    Anim.seeOut(noteWrap);

    const note = getNote(id);
    q("#noteid").value = note.id;
    q("#title").value = JSON.parse(note.title);
    q("#note").value = JSON.parse(note.body);

    Anim.show(newNote);
  }
};

const dialog = (e) => {
  e.stopPropagation();
  e.stopImmediatePropagation();

  let icon = e.target;
  if (icon.tagName === "path") {
    icon = icon.parentNode;
  }
  const parentRow = icon.closest(".note-row[data-noteid]");
  const id = parentRow && parentRow.dataset.noteid;
  const dialog = parentRow.querySelector(".note-confirm-delete");

  if (icon.dataset.confirm == -1) {
    icon.classList.add("note-delete");
    dialog.classList.add("open");
    Anim.show(dialog);
    icon.dataset.confirm = 1;
    Anim.show(bg);
    return;
  } else {
    if (icon.dataset.confirm == 1) {
      Anim.hide(bg);
      deleteNote(id);
      Alerts.showAlert("success", "Note Deleted");
      Anim.hide(dialog);
      renderNotes();
      setTimeout(() => {
        Alerts.hideAlert();
      }, 1500);
    }
  }
};

const renderIcon = (id) => {
  if (id == -1) {
    return wire()`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="white" class="note-icon rotate45">
                  <path d="M32.283 16.302l1.414 1.415-15.98 15.98-1.414-1.414z"/>
                  <path d="M17.717 16.302l15.98 15.98-1.414 1.415-15.98-15.98z"/>
              </svg>`;
  }
  return wire()`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="#ff3a3a" class="note-icon del-icon" onclick=${dialog} data-confirm="-1">
                  <path d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17-7.6 17-17 17zm0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15z"/>
                  <path d="M32.283 16.302l1.414 1.415-15.98 15.98-1.414-1.414z"/>
                  <path d="M17.717 16.302l15.98 15.98-1.414 1.415-15.98-15.98z"/>
              </svg>`;
};

const noteRow = (note) => wire()`<div>
        <div class="row note-row row-border" data-noteid=${
          note.id
        } onclick=${noteHandler}>
            <div class="note-confirm-delete d-none">
            Are you sure? Press again to delete this note.
                <div class="speech-arrow"></div>    
            </div>
            
            <div class="note-title col-11">
                <p>${note.title}</p>
            </div>
            <div class="col-1">
                ${renderIcon(note.id)}
            </div>
        </div>
    </div>`;

const getNote = (id) => {
  const title = window.localStorage.getItem(`title-${id}`);
  const body = window.localStorage.getItem(`body-${id}`);
  if (title && body) {
    return {
      id,
      title,
      body,
    };
  }
  return {
    id: -1,
    title: `add new note`,
  };
};
const getAllIds = () => JSON.parse(window.localStorage.getItem("noteids"));
const getNextNoteId = () => {
  const ids = getAllIds();
  // localStorage.noteids starts with element 0 == -1
  if (ids.length === 1 && ids[0] === -1) {
    return 1;
  }
  return +ids[ids.length - 1] + 1;
};
const setNote = (title, body, id) => {
  const ids = getAllIds();
  window.localStorage.setItem(`title-${id}`, JSON.stringify(title));
  window.localStorage.setItem(`body-${id}`, JSON.stringify(body));
  if (ids.includes(id)) {
    return;
  } else {
    ids.push(id);
    window.localStorage.setItem("noteids", JSON.stringify(ids));
  }
};
const deleteNote = (id) => {
  const ids = getAllIds();
  const newIds = ids.filter((noteid) => noteid != id);
  window.localStorage.removeItem(`title-${id}`);
  window.localStorage.removeItem(`body-${id}`);
  window.localStorage.setItem("noteids", JSON.stringify(newIds));
};

const renderNotes = () => {
  bind(noteList)`${getAllIds().map((id) => noteRow(getNote(id)))}`;
};
renderNotes();

on(saveNoteBtn, "click", (e) => {
  const idInput = newNote.querySelector("#noteid");
  const titleInput = newNote.querySelector("#title");
  const bodyInput = newNote.querySelector("#note");

  const id = idInput.value;
  const title = titleInput.value;
  const body = bodyInput.value;

  if (!title || !body) {
    titleInput.value = "";
    bodyInput.value = "";
    Anim.hide(newNote);
    Anim.bringIn(noteWrap);
    return;
  }

  setNote(title, body, id);
  Alerts.showAlert("success", "Note Saved!");
  Anim.hide(newNote);
  renderNotes();
  Anim.bringIn(noteWrap);
  titleInput.value = "";
  bodyInput.value = "";
  setTimeout(() => {
    Alerts.hideAlert();
  }, 1750);
});
