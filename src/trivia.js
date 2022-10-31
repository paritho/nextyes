import { bind, wire } from "hyperhtml";
import { createModal } from "./modal.js";
import { renderMenu } from "./menu.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";
import { off, on, q, qa } from "./utils.js";
import { getCookieValue } from "./loginUtils.js";

renderMenu();

const intro = q(".intro");
const triviaWrap = q(".trivia-wrap");
const triviaViewer = q(".trivia-viewer");
const qaView = q(".qaView");
const leaderboard = q(".help-icon");
const buttonWrap = q(".select");
const score = q(".score");
const scoreWrap = q(".score-wrap");
const gameoverWrap = q(".gameover");

const renderScore = bind(score);
let currentQuestion = {};

const buttonMaker = (isNext) => {
  return wire()`<button class="btn btn-primary" onclick=${
    isNext ? goToNext : checkAnswer
  }>${isNext ? "next" : "submit answer"}</button>`;
};

on(leaderboard, "click", (event) => (window.location.href = "/leaderboard"));

const gameOver = () => {
  Anim.hide(triviaWrap);

  Anim.bringIn(gameoverWrap);

  const tCookie = JSON.parse(getCookieValue("trivia"));
  tCookie.gameOver = true;
  document.cookie = `trivia=${JSON.stringify(tCookie)}`;
  postScore(tCookie.score);
};

let modal = {};

const goToNext = (event) => {
  modal.close();
  // clearQuestion();
  currentQuestion = tData.shift();
  if (!tData.length) {
    return gameOver();
  }
  nextQuestion(currentQuestion);
};

const postScore = (score) => {
  const userData = {
    hash: getCookieValue("user"),
    score,
  };
  fetch("/score", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }).catch((error) => {
    console.error(`There was a problem posting the score: ${error}`);
  });
};

const checkAnswer = (event) => {
  // gather correct answer
  const answered = q(".selected");
  if (!answered) {
    Alerts.showAlert("warn", "Please select an answer");
    setTimeout(() => {
      Alerts.hideAlert();
    }, 2000);
    return;
  }

  const answer = +answered.dataset.idx;
  let correct = +currentQuestion.correct === answer;
  answered.classList.remove("selected");
  if (correct) {
    answered.classList.add("correct");
  } else {
    const correctAnswer = q(`[data-idx="${currentQuestion.correct}"]`)
    correctAnswer.classList.add("correct");
    answered.classList.add("incorrect");
    Anim.wiggle(answered);
  }

  renderScore`${correct ? +score.textContent + 1 : score.textContent}`;
  const justification = wire()`<div>
        <p>Your answer was ...</p>
        <p>${correct ? "CORRECT!" : "Not quite right"}</p>
        ${{ html: currentQuestion.answer }}
      </div>`;
  modal = createModal(
    "and the answer is",
    justification,
    buttonMaker(true),
    true
  );
  setTimeout(() => {
    modal.open();
    clearQuestion();
  }, 1000);

  //get and write new cookie
  const tCookie = JSON.parse(getCookieValue("trivia"));
  tCookie.answers.push(answer);
  tCookie.score = score.textContent;
  tCookie.questions = tData.map((item) => item.id);
  document.cookie = `trivia=${JSON.stringify(tCookie)}`;
};


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

// initDelay is used like a boolean, though when we call this
// from an event handler, it's the event.
const showQuestions = (initDelay) => {
  if (initDelay) {
    setTimeout(() => {
      Anim.hide(intro);
    }, 250);
  } else {
    Anim.hide(intro);
  }
  const tCookie = JSON.parse(getCookieValue("trivia"));

  if(tCookie.gameOver){
    Anim.bringIn(gameoverWrap)
    return
  }

  setTimeout(() => {
    Anim.bringIn(triviaWrap);
    Anim.bringIn(triviaViewer);
    Anim.bringIn(scoreWrap);
  }, 250);

  tCookie.started = true;
  document.cookie = `trivia=${JSON.stringify(tCookie)}`;
};

const clearQuestion = () => {
  Anim.hide(triviaViewer);
  setTimeout(() => {
    Anim.bringIn(triviaViewer);
  }, 150);
  renderQA``;
};

const nextQuestion = (data) => {
  renderQA`<div class="question"><p>${data.question}</p></div>
                    <div class="answers-wrap">
                        <ul class="answers">
                        ${data.answers.map(
                          (ans, idx) =>
                            wire()`<li onclick="${select}" data-idx="${idx}">${ans}</li>`
                        )}
                        </ul>
                    </div>
            <div class="select">${buttonMaker()}</div>`;
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
      renderScore`${gameState.score}`;
      tData = gameState.questions.map((id) =>
        tData.find((data) => data.id == id)
      );
      showQuestions(false);
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
  currentQuestion = tData.shift();
  nextQuestion(currentQuestion);
})();

on(intro, "click", showQuestions);
