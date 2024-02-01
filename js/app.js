const cardsConfig = [
  "건치냐",
  "경멸하냐",
  "극락냐",
  "극혐하냐",
  "냐거덩",
  "냐린이",
  "니가최고냐",
  "마카롱이냐",
  "미소냐",
  "반갑냐",
  "반짝반짝냐",
  "반했냐",
  "부끄럽냐",
  "뿌듯하냐",
  "쉿몽환의냐",
  "시러하냐",
  "아잉몰라냐",
  "양손따봉냐",
  "양손브이냐",
  "양손브이냐2",
  "우냐",
  "우냐핫걸",
  "음침냐",
  "응원하냐",
  "응원하냐2",
  "입벌려냐",
  "자냐",
  "잘가냐",
  "잘자냐",
  "질색하냐",
  "칼든냐",
  "큰칼들었냐",
  "팡팡우냐",
  "한손따봉냐",
  "한손브이냐",
  "헤헷냐",
  "화났냐",
  "흐뭇하냐",
  "흑화했냐",
];
const audioConfig = [
  "냐1",
  "냐2",
  "냐하하",
  "냥",
  "멍",
  "멍멍멍",
  "아 나 안해 진짜",
];
const effectConfig = [
  "bgm",
  "horr",
  "fail",
  "game_start",
  "mission"
]
let openCards = [];
let matchedCards = [];
let moves = 0;
let clockOff = true;
let time = 30;
let clockId;
let score = 0;
let combo = 0;
let failCombo = 0;
let size = { x: 4, y: 4, count: 16 };

// 랜덤 카드 8개 뽑기
let randomCards = cardsConfig.sort(() => Math.random() - Math.random());
let cards = [];
toggleModal();
setCards();
startGame();

// 오디오 프리로드
let audio = [];
for (let i = 0; i < audioConfig.length; i++) {
  const key = audioConfig[i];
  audio[key] = new Audio(`audio/${audioConfig[i]}.wav`);
}

// 이미지 프리로드
let images = [];
for (let i = 0; i < cardsConfig.length; i++) {
  const key = cardsConfig[i];
  images[key] = new Image();
  images[key].src = `data/${cardsConfig[i]}.png`;
}

// 이펙트 프리로드
let effects = [];
for (let i = 0; i < effectConfig.length; i++) {
  const key = effectConfig[i];
  effects[key] = new Audio(`effect/${effectConfig[i]}.mp3`);
}

// EL Init
const cardsList = document.querySelectorAll(".card"); // nodelist of cards
const reset = document.querySelector(".fa-repeat"); // restart button
const deck = document.querySelector(".deck");
const fireworksEl = document.getElementById("fireworks");
const modal_replay = document.querySelector(".modal_replay");

/**
 * Generate Grid
 * @param {string} cardname
 * @returns {string} HTML string
 */
function generateGrid(card) {
  return `<li class="card">
            <img src="data/${card}.png" alt="${card}" class="card-img ${card}">
          </li>`;
}

/**
 * Card List Setting
 */
function setCards() {
  cards = [];
  for (let i = 0; i < size.count / 2; i++) {
    cards.push(randomCards[i]);
    cards.push(randomCards[i]);
  }

  const deck = document.querySelector(".deck");
  for(let i = 0; i < deck.classList.length; i++) {
    if(deck.classList[i].includes("x")) {
      deck.classList.remove(deck.classList[i]);
    }
  }
  deck.classList.add(`x${size.x}`);
}

/**
 * Card List Suffling
 * @param {Array} array
 * @returns {Array} suffled array
 */
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

/**
 * Game Endding
 */
function endGame() {
  for (let i = 0; i < 10; i++) {
    Toastify({
      text: "시간 초과! 게임이 종료되었습니다.",
      className: "error",
    }).showToast();
  }

  // BGM 정지
  effects["horr"].play();
  effects["bgm"].pause();
  setTimeout(function () {
    audio["아 나 안해 진짜"].play();
  }, 300);
  setTimeout(function () {
    effects["fail"].play();
  }, 3500);
}

/**
 * Start Game
 */
function startGame() {
  const deck = document.querySelector(".deck"); //shuffles deck
  let cardHTML = shuffle(cards).map(function (card) {
    return generateGrid(card);
  });
  deck.innerHTML = cardHTML.join(""); // generates grid
}

/**
 * Add Moved Count
 */
function addMoves() {
  moves++;
  const movesText = document.querySelector(".moves");
  movesText.innerHTML = moves;
}

/**
 * Calculate Score (Score is Matched Card Count)
 */
function checkScore() {
  if (score === size.count / 2) {
    fireworksEl.style.display = "block";
    animate();
    setInterval(function () {
      let x = (Math.random() * canvas.width) / window.devicePixelRatio;
      let color = colors[Math.floor(Math.random() * colors.length)];
      fireworks.push(
        new Firework(x, canvas.height / window.devicePixelRatio, color)
      );
    }, 1000);
    stopClock();

    // 냐하하
    setTimeout(function () {
      audio["냐하하"].play();
    }, 500);
  }
}

/**
 * Card Click Check
 * @param {HTMLElement} clickTarget
 * @returns {boolean} is card?
 */
function evaluateClick(clickTarget) {
  return (
    clickTarget.classList.contains("card") &&
    !clickTarget.classList.contains("open") && // prevents clicking open card
    !clickTarget.classList.contains("match") && // prevents clicking on matched cards
    openCards.length < 2 && // prevents more than 3 cards firing event
    !openCards.includes(clickTarget) // prevents double click on one card
  );
}

/**
 * Card Click Event
 */
deck.addEventListener("click", (event) => {
  const clickTarget = event.target;

  // timer is started
  if (time < 1) {
    Toastify({
      text: "제한 시간이 경과되었어요!",
      className: "error",
    }).showToast();
    return;
  }

  addMoves();

  if (evaluateClick(clickTarget)) {
    if (clockOff) {
      startClock();
      clockOff = false;
    }
    toggleCard(clickTarget); //opens card
    openCards.push(clickTarget); // send to openCards array

    if (openCards.length === 2) {
      checkIfCardsMatch();
      checkScore();
    }
    effects["mission"].play();
  }
});

/**
 * toggleCard
 * @param {HTMLElement} clickTarget
 * @returns {void}
 */
function toggleCard(clickTarget) {
  clickTarget.classList.toggle("open");
  clickTarget.classList.toggle("show");
}

/**
 * displayCombo
 */
function displayCombo() {
  if (combo > 0) {
    Toastify({
      text: `${combo} 콤보!`,
      className: "info",
    }).showToast();

    switch(combo) {
      case 1:
        audio["냐1"].play();
        break;
      case 2:
        audio["냐2"].play();
        break;
      default:
        audio["냐하하"].play();
        break;
    }
  }
}

/**
 * displayFailCombo
 */
function displayFailCombo() {
  if(failCombo >= 4) {
    audio["멍멍멍"].play();
    Toastify({
      text: `${failCombo} 연속 못맞춤! 멍멍멍!`,
      className: "error",
    }).showToast();
  } else {
    audio["멍"].play();
    Toastify({
      text: `${failCombo} 연속 못맞춤!`,
      className: "error",
    }).showToast();
  }
}

/**
 * Check If Cards Match
 * @returns {void}
 */
function checkIfCardsMatch() {
  if (
    openCards[0].firstElementChild.className ===
    openCards[1].firstElementChild.className
  ) {
    console.log(
      "match",
      openCards[0].firstElementChild.className,
      openCards[1].firstElementChild.className
    );

    openCards[0].classList.toggle("match");
    openCards[1].classList.toggle("match");
    matchedCards.push(openCards[0]);
    matchedCards.push(openCards[1]);
    openCards = [];
    score++;
    combo++;
    failCombo = 0;
    displayCombo();
  } else {
    setTimeout(function () {
      openCards.forEach(function (card) {
        card.classList.remove("open", "show");
      });

      openCards.length = 0;
      score = 0;
      combo = 0;
      failCombo++;
      displayFailCombo();
    }, 600);
  }
}

/**
 * display time
 * @returns {void}
 */
function displayTime() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const clock = document.querySelector(".clock");
  clock.innerHTML = time;
  if (seconds < 10) {
    clock.innerHTML = `${minutes}:0${seconds}`;
  } else {
    clock.innerHTML = `${minutes}:${seconds}`;
  }
}

/**
 * start timer
 * @returns {void}
 */
function startClock() {
  // prints seconds in dev console
  clockId = setInterval(() => {
    time--;
    displayTime();
    if (time == 0) {
      stopClock();
      endGame();
    }
  }, 1000);
}

/**
 * stop timer
 * @returns {void}
 */
function stopClock() {
  clearInterval(clockId);
  clockOff = true;
}

/**
 * toggle modal visibility
 * @returns {void}
 */
function toggleModal() {
  const modal = document.querySelector(".modal_background");
  modal.classList.toggle("hide");
}

/**
 * replay setting
 * @returns {void}
 */
modal_replay.addEventListener("click", () => {
  const set_size = document.querySelector("#set_size"); // 2x2, 4x4, 6x6, 8x8
  const sizt_params = set_size.value.split("x");
  size.x = parseInt(sizt_params[0]);
  size.y = parseInt(sizt_params[1]);
  size.count = size.x * size.y;

  const set_time = document.querySelector("#set_time");
  time = set_time.value;

  // Effect 재생
  effects["game_start"].play();

  // BGM 재생
  setTimeout(function () {
    effects["bgm"].play();
    effects["bgm"].loop = true;
  }, 2200);

  setCards();
  startGame();
  displayTime();
  checkScore();
  toggleModal();
});

/**
 * Volume Control
 */
const set_bgm_volume = document.getElementById('set_bgm_volume'); // input range
const set_effect_volume = document.getElementById('set_effect_volume'); // input range
const set_audio_volume = document.getElementById('set_audio_volume'); // input range

set_effect_volume.addEventListener('change', () => {
  for(let i = 0; i < effectConfig.length; i++) {
    const key = effectConfig[i];
    effects[key].volume = set_effect_volume.value / 100;
  }
  Toastify({
    text: `효과음 볼륨 ${set_effect_volume.value}%`,
    className: "info",
  }).showToast();
});

set_bgm_volume.addEventListener('change', () => {
  effects['bgm'].volume = set_bgm_volume.value / 100;
  Toastify({
    text: `BGM 볼륨 ${set_bgm_volume.value}%`,
    className: "info",
  }).showToast();
});

set_audio_volume.addEventListener('change', () => {
  for(let i = 0; i < audioConfig.length; i++) {
    const key = audioConfig[i];
    audio[key].volume = set_audio_volume.value / 100;
  }
  Toastify({
    text: `보이스 볼륨 ${set_audio_volume.value}%`,
    className: "info",
  }).showToast();
});

// default volume
set_bgm_volume.value = 50;
set_effect_volume.value = 50;
set_audio_volume.value = 50;