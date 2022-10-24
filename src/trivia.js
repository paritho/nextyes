import { bind, wire } from "hyperhtml";
import { createModal } from "./modal.js";
import * as Anim from "./animations.js";
import * as Alerts from "./alerts.js";
import { off, on, q, qa } from "./utils.js";
import { getCookieValue } from "./loginUtils.js";

const intro = q(".intro");
const triviaWrap = q('.trivia-wrap');
const triviaViewer = q(".trivia-viewer");
const qaView = q(".qaView");
const leaderboard = q(".help-icon");
const next = q(".select button");
const score = q(".score");
const scoreWrap = q(".score-wrap");
let currentQuestion = {}

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
  let correct = +currentQuestion.correct === answer;
  answered.classList.remove('selected')
  if(correct){
    answered.classList.add('correct')
  } else {
    answered.classList.add('incorrect');
  }

  updateScore(correct);
  showJustification();


  // clearQuestion();
  currentQuestion = tData.shift();
  if(!currentQuestion){
    return gameOver()
  }
  // nextQuestion(currentQuestion)

  //get and write new cookie
  const tCookie = JSON.parse(getCookieValue('trivia'));
  tCookie.answers.push(answer)
  tCookie.questions = tData.map((item) => item.id);
  document.cookie = `trivia=${JSON.stringify(tCookie)}`
})

const updateScore = (scored) => {
  bind(score)`${scored ? +score.textContent + 1 : score.textContent}`
}

const showJustification = () => {}

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
    Anim.bringIn(triviaViewer);
    Anim.bringIn(scoreWrap)
  }, 250);
  const tCookie = JSON.parse(getCookieValue('trivia'));
  tCookie.started = true;
  document.cookie = `trivia=${JSON.stringify(tCookie)}`
};

const clearQuestion = () => {
  Anim.hide(triviaViewer)
  setTimeout(()=>{
    Anim.bringIn(triviaViewer)
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
  currentQuestion = tData.shift()
  nextQuestion(currentQuestion);
})();

on(intro, "click", showQuestions);
