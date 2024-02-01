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
  "mission",
  "success",
];
let openCards = [];
let matchedCards = [];
let moves = 0;
let clockOff = true;
let score = 0;
let time = 30;
let clockId;
let success = 0; // success count
let combo = 0; // success combo count
let failCombo = 0; // fail combo count
let fail = 0; // fail total count
let size = { x: 4, y: 4, count: 16 };
let settings = { time: 30, size: "4x4" };

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
  audio[key] = new Audio(`audio/${audioConfig[i]}.wav?v2`);
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
  for (let i = 0; i < deck.classList.length; i++) {
    if (deck.classList[i].includes("x")) {
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
 * Update Score
 */
function updateScore() {
  const scoreText = document.querySelector(".score");
  score = 100 + success * 100 - fail * 10;
  scoreText.innerHTML = score;
}

/**
 * Calculate Success (Success is Matched Card Count)
 */
function checkSuccess() {
  if (success === size.count / 2) {
    fireworksEl.style.display = "block";
    animate();
    setInterval(function () {
      let x = (Math.random() * canvas.width) / window.devicePixelRatio;
      let color = colors[Math.floor(Math.random() * colors.length)];
      if (fireworks.length < 50) {
        fireworks.push(
          new Firework(x, canvas.height / window.devicePixelRatio, color)
        );
      }
    }, 1000);
    stopClock();

    // 게임 종료
    setTimeout(function () {
      effects["success"].play();
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
      checkSuccess();
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

    switch (combo) {
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
  if (failCombo >= 4) {
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
    success++;
    combo++;
    failCombo = 0;
    displayCombo();
  } else {
    setTimeout(function () {
      openCards.forEach(function (card) {
        card.classList.remove("open", "show");
      });

      openCards.length = 0;
      combo = 0;
      fail++;
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
  clockId = setInterval(() => {
    time--;
    displayTime();
    updateScore();
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

  // 설정에 저장
  settings.size = set_size.value;
  settings.time = set_time.value;

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
  checkSuccess();
  toggleModal();
});

/**
 * Volume Control
 */
const set_bgm_volume = document.getElementById("set_bgm_volume");
const set_effect_volume = document.getElementById("set_effect_volume");
const set_audio_volume = document.getElementById("set_audio_volume");

const set_bgm_mute_toggle = document.getElementById("set_bgm_mute_toggle");
const set_effect_mute_toggle = document.getElementById(
  "set_effect_mute_toggle"
);
const set_audio_mute_toggle = document.getElementById("set_audio_mute_toggle");

// 음소거 토글 및 볼륨 조절을 위한 공통 함수
const changeVolume = (config, volumeSlider, toggleButton, typeText) => {
  let volume = volumeSlider.value / 100;
  config.forEach((key) => {
    if (typeText === "effects" && key === "bgm") effects[key].volume = volume;
    (typeText === "effects" ? effects[key] : audio[key]).volume = volume;
  });

  if (volume === 0) {
    toggleButton.classList.replace("fa-volume-up", "fa-volume-off");
  } else if (volume > 0) {
    toggleButton.classList.replace("fa-volume-off", "fa-volume-up");
  }

  Toastify({
    text: `${typeText === "effects" ? "효과음" : typeText} 볼륨 ${
      volumeSlider.value
    }%`,
    className: "info",
  }).showToast();
};

// 음소거 토글을 위한 공통 함수
const toggleMute = (config, toggleButton, volumeSlider, typeText) => {
  if (
    (typeText === "effects" ? effects[config[0]] : audio[config[0]]).volume > 0
  ) {
    config.forEach((key) => {
      (typeText === "effects" ? effects[key] : audio[key]).volume = 0;
    });
    toggleButton.classList.replace("fa-volume-up", "fa-volume-off");
    volumeSlider.value = 0; // 음소거 시 볼륨 슬라이더 값을 0으로 설정
  } else {
    const volume = 0.5; // 볼륨을 50%로 설정
    config.forEach((key) => {
      (typeText === "effects" ? effects[key] : audio[key]).volume = volume;
    });
    toggleButton.classList.replace("fa-volume-off", "fa-volume-up");
    volumeSlider.value = Math.round(volume * 100); // 볼륨 슬라이더 값을 50으로 설정
  }
};

set_bgm_volume.addEventListener("change", () =>
  changeVolume(["bgm"], set_bgm_volume, set_bgm_mute_toggle, "effects")
);

set_effect_volume.addEventListener("change", () =>
  changeVolume(
    effectConfig.filter((key) => key !== "bgm"),
    set_effect_volume,
    set_effect_mute_toggle,
    "effects"
  )
);

set_audio_volume.addEventListener("change", () =>
  changeVolume(audioConfig, set_audio_volume, set_audio_mute_toggle, "audio")
);

set_bgm_mute_toggle.addEventListener("click", () =>
  toggleMute(["bgm"], set_bgm_mute_toggle, set_bgm_volume, "effects")
);

set_effect_mute_toggle.addEventListener("click", () =>
  toggleMute(
    effectConfig.filter((key) => key !== "bgm"),
    set_effect_mute_toggle,
    set_effect_volume,
    "effects"
  )
);

set_audio_mute_toggle.addEventListener("click", () =>
  toggleMute(audioConfig, set_audio_mute_toggle, set_audio_volume, "audio")
);

// 기본 볼륨 설정
["set_bgm_volume", "set_effect_volume", "set_audio_volume"].forEach(
  (id) => (document.getElementById(id).value = 50)
);
