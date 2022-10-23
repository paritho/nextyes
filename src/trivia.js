import { bind, wire } from "hyperhtml";
import { createModal } from "./modal.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";
import { off, on, q, qa } from "./utils.js";
import { getCookieValue } from "./loginUtils.js";

const intro = q(".intro");
const triviaWrap = q(".trivia-wrap");
const qaView = q(".qaView");
const leaderboard = q(".help-icon");
const next = q(".select button");

on(leaderboard, "click", (event) => (window.location.href = "/leaderboard"));
on(next, 'click', (event)=>{
  // gather correct answer
  const answered = q('.selected');
  if(!answered){
    Alerts.showAlert("warn", "Please select an answer")
    setTimeout(() => {
      Alerts.hideAlert();
    }, 2000);
    return;
  }
  const answer = +answered.dataset.idx;

  clearQuestion();
  const question = tData.shift();
  if(!question){
    return gameOver()
  }
  nextQuestion(question)

  //get and write new cookie
  const tCookie = JSON.parse(getCookieValue('trivia'));
  tCookie.answers.push(answer)
  tCookie.questions = tData.map((item) => item.id);
  document.cookie = `trivia=${JSON.stringify(tCookie)}`
})

const renderQA = bind(qaView);
let tData = {};
let answers = [];
let started = false;

const shuffle = (array) => {
  const toShuffle = [...array];
  let idx = toShuffle.length - 1;
  for (; idx > 0; idx--) {
    const temp = Math.floor(Math.random() * (idx + 1));
    [toShuffle[idx], toShuffle[temp]] = [toShuffle[temp], toShuffle[idx]];
  }
  return toShuffle;
};

const select = (event) => {
  qa(".answers li").forEach((item) => item.classList.remove("selected"));
  event.target.classList.add("selected");
};

const showQuestions = (event) => {
  setTimeout(() => {
    Anim.hide(intro);
  }, 250);
  setTimeout(() => {
    Anim.bringIn(triviaWrap);
  }, 250);
  const tCookie = JSON.parse(getCookieValue('trivia'));
  tCookie.started = true;
  document.cookie = `trivia=${JSON.stringify(tCookie)}`
};

const clearQuestion = () => {
  Anim.hide(triviaWrap)
  setTimeout(()=>{
    Anim.bringIn(triviaWrap)
  },150)
  renderQA``;
}

const nextQuestion = (data) => {
  renderQA`<div class="question"><p>${data.question}</p></div>
                    <div class="answers-wrap">
                        <ul class="answers">
                        ${data.answers.map(
                          (ans, idx) => wire()`<li onclick="${select}" data-idx="${idx}">${ans}</li>`
                        )}
                        </ul>
                    </div>`;
  return data;
};


(async () => {
  const res = await fetch("./data/trivia.json").catch(console.error);
  tData = await res.json();

  // {started: boolean, score: num }
  let gameState = getCookieValue("trivia");
  if (gameState) {
    gameState = JSON.parse(gameState);
    if (gameState.started) {
      answers = gameState.answers;
      tData = gameState.questions.map((id) =>
        tData.find((data) => data.id == id)
      );
      showQuestions();
    }
  } else {
    tData = shuffle(tData);
    const toStringify = tData.map((item) => item.id);

    document.cookie = `trivia=${JSON.stringify({
      started,
      answers,
      questions: toStringify,
    })}`;
  }

  // this is always the first one, so no need to check if tData has entries
  nextQuestion(tData.shift());
})();

on(intro, "click", showQuestions);
