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

on(leaderboard, "click", (event) => (window.location.href = "/leaderboard"));

const renderQA = bind(qaView);

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
    off(intro, "click", showQuestions);
  }, 250);
  setTimeout(() => {
    Anim.bringIn(triviaWrap);
  }, 250);
};

const nextQuestion = (data) => {
  const qToRender = data.shift();
  renderQA`<div class="question"><p>${qToRender.question}</p></div>
                    <div class="answers-wrap">
                        <ul class="answers">
                        ${qToRender.answers.map(
                          (ans) => wire()`<li onclick="${select}">${ans}</li>`
                        )}
                        </ul>
                    </div>`;
};

let tData = {};
let score = 0;
(async () => {
  const res = await fetch("./data/trivia.json").catch(console.error);
  tData = await res.json();

  // {started: boolean, score: num }
  let gameState = getCookieValue("trivia");
  if (gameState) {
    gameState = JSON.parse(gameState);
    if (gameState.started) {
      score = gameState.score;
      tData = gameState.questions.map((id) =>
        tData.find((data) => data.id == id)
      );
      showQuestions();
    }
  } else {
    tData = shuffle(tData);
    const toStringify = tData.map((item) => item.id);

    document.cookie = `trivia=${JSON.stringify({
      started: true,
      score,
      questions: toStringify,
    })}`;
  }
  nextQuestion(tData);
})();

on(intro, "click", showQuestions);
