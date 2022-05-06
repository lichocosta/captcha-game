const gridContainer = document.getElementById('grid');
const wordOneInput = document.getElementById('wordOne');
const wordTwoInput = document.getElementById('wordTwo');
const startButton = document.getElementById('start');
const sendButton = document.getElementById('send');
const restartButton = document.getElementById('restart');
const timer = document.getElementById('timer');
const objetiveGame = document.getElementById('objetiveGame');
const welcomeSection = document.getElementById('welcomeSection');
const gameSection = document.getElementById('gameSection');
const resultSection = document.getElementById('resultSection');
const scoreNumberSpan = document.getElementById('scoreNumber');
const quantityCorrectSpan = document.getElementById('quantityCorrectSpan');
const selectedWordQuantitySpan = document.getElementById('selectedWordQuantitySpan');
const quantityIncorrectImagesSpan = document.getElementById('quantityIncorrectImagesSpan');
const elapsedTimeSpan = document.getElementById('elapsedTimeSpan');
const columnCountInput = document.getElementById('columnCountInput');
const rowCountInput = document.getElementById('rowCountInput');
const saveSettings = document.getElementById('saveSettings');

const GAME_LENGTH_IN_SECONDS = 15;
const MAX_ROWCOLS_NUMBER = 7;
const MIN_ROWCOLS_NUMBER = 2;

let rowCount = 4;
let columnCount = 4;
let totalImageCount = rowCount * columnCount;
let randomNumber = Math.random() * (totalImageCount / 2 - 3 + 1) + 3;
let quantityWordOne = Math.floor(randomNumber);
let quantityWordTwo = totalImageCount - quantityWordOne;
let selectedWord;
let selectedWordQuantity;
let isPlaying = false;
let seconds = GAME_LENGTH_IN_SECONDS;
let interval;

gridContainer.style = `grid-template-columns: repeat(${columnCount}, 0fr);`

async function getImagesByKeyword(keyword, quantity) {
  const url = `https://api.unsplash.com/search/photos?query=${keyword}&per_page=${quantity}&client_id=Y9V-BNTn2mzBgNVlYw4JOIeEuI8BYYpVt4VnSmt3PxM`;
  const response = await fetch(url);

  if (response.status !== 200) {
    return console.error(response.statusText);
  }

  const data = await response.json();
  const images = data.results.map(image => ({
    id: image.id,
    url: image.urls.small,
    word: keyword
  }));
  return images;
}

function shuffle(array) {
  return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

function renderGrid(images) {
  gridContainer.textContent = "";

  images.forEach(image => {
    let imageContainer = document.createElement("div");
    imageContainer.innerHTML = `
        <input id="${image.id}" class="image-checkbox d-none" type="checkbox" data-word="${image.word}"/>
        <label for="${image.id}">
          <img src="${image.url}">
        </label>`;

    gridContainer.appendChild(imageContainer);
  })
}

function startTimer() {
  interval = setInterval(() => {
    seconds--
    timer.textContent = seconds;
    if (seconds <= 0) {
      sendButton.click();
    }
  }, 1000)
}

function getWords() {
  wordOne = wordOneInput.value.trim().toLowerCase();
  wordTwo = wordTwoInput.value.trim().toLowerCase();
  if (wordOne == "" || wordTwo == "") {
    alert('At least one field is empty.');
    return [];
  }
  if (wordOne == wordTwo) {
    alert("Words can't be the same.");
    return [];
  }
  return [wordOne, wordTwo];
}

async function getImages(wordOne, wordTwo) {
  const imagesWordOne = await getImagesByKeyword(wordOne, quantityWordOne);
  const imagesWordTwo = await getImagesByKeyword(wordTwo, quantityWordTwo);
  if (imagesWordOne.length < quantityWordOne) {
    alert(`Not enough images found for ${wordOne}. Please enter another instead.`);
    return [];
  }
  if (imagesWordTwo.length < quantityWordTwo) {
    alert(`Not enough images found for ${wordTwo}. Please enter another instead.`);
    return [];
  }
  imagesWordOne.length = quantityWordOne;
  imagesWordTwo.length = quantityWordTwo;

  return [...imagesWordOne, ...imagesWordTwo];
}

async function startGame(images, selectedWord) {
  if (isPlaying) return;

  const shuffledImages = shuffle(images);

  renderGrid(shuffledImages);
  
  objetiveGame.innerHTML = selectedWord;
  
  isPlaying = true;
  startTimer()
}

startButton.addEventListener('click', async () => {
  const words = getWords();
  if (words.length == 0) return;
  const images = await getImages(wordOne, wordTwo);
  if (images.length == 0) return;
  
  selectedWord = quantityWordOne < quantityWordTwo ? wordOne : wordTwo;
  selectedWordQuantity = quantityWordOne < quantityWordTwo ? quantityWordOne : quantityWordTwo;

  welcomeSection.classList.add('d-none');
  gameSection.classList.remove('d-none');
  await startGame(images, selectedWord);
})

sendButton.addEventListener('click', () => {
  gameSection.classList.add('d-none');
  resultSection.classList.remove('d-none');
  restartButton.classList.add('bounce');
  finishGame();
})

restartButton.addEventListener('click', () => {
  resultSection.classList.add('d-none');
  welcomeSection.classList.remove('d-none');
  startButton.classList.add('swing');
  wordOneInput.value = "";
  wordTwoInput.value = "";
})

function finishGame() {
  const selectedImages = gridContainer.querySelectorAll('.image-checkbox:checked')
  const correctSelectedImages = [...selectedImages].filter(checkbox => checkbox.dataset.word == selectedWord)
  const incorrectSelectedImages = [...selectedImages].filter(checkbox => checkbox.dataset.word != selectedWord)

  let quantityCorrectImages = correctSelectedImages.length;
  let quantityIncorrectImages = incorrectSelectedImages.length;
  let elapsedTime = GAME_LENGTH_IN_SECONDS - seconds;
  let score = (seconds / GAME_LENGTH_IN_SECONDS) * 100 + (quantityCorrectImages / selectedWordQuantity) * 100;

  scoreNumberSpan.textContent = Math.round(score);
  quantityCorrectSpan.textContent = quantityCorrectImages;
  selectedWordQuantitySpan.textContent = selectedWordQuantity;
  quantityIncorrectImagesSpan.textContent = quantityIncorrectImages;
  elapsedTimeSpan.textContent = elapsedTime;

  clearInterval(interval)
  seconds = GAME_LENGTH_IN_SECONDS;
  isPlaying = false;
}

saveSettings.addEventListener('click', () => {
  columnCount = parseInt(columnCountInput.value);
  if (columnCount > MAX_ROWCOLS_NUMBER) columnCount = MAX_ROWCOLS_NUMBER;
  if (isNaN(columnCount) || columnCount < MIN_ROWCOLS_NUMBER) columnCount = MIN_ROWCOLS_NUMBER;
  rowCount = parseInt(rowCountInput.value);
  if (rowCount > MAX_ROWCOLS_NUMBER) rowCount = MAX_ROWCOLS_NUMBER;
  if (isNaN(rowCount) || rowCount < MIN_ROWCOLS_NUMBER) rowCount = MIN_ROWCOLS_NUMBER;

  totalImageCount = rowCount * columnCount;
  randomNumber = Math.random() * (totalImageCount / 2 - 3 + 1) + 3;
  quantityWordOne = Math.floor(randomNumber);
  quantityWordTwo = totalImageCount - quantityWordOne;
  gridContainer.style = `grid-template-columns: repeat(${columnCount}, 0fr);`
})

function validateColsRowsNumber(event) {
  let number = parseInt(event.target.value);
  if (number > MAX_ROWCOLS_NUMBER) event.target.value = MAX_ROWCOLS_NUMBER;
  if (isNaN(number) || number < MIN_ROWCOLS_NUMBER) event.target.value = MIN_ROWCOLS_NUMBER;
}

columnCountInput.addEventListener('blur', validateColsRowsNumber)
rowCountInput.addEventListener('blur', validateColsRowsNumber)


wordOneInput.addEventListener("keyup", (event) => {
  if (event.key !== "Enter") return;
  wordTwoInput.focus();
});

wordTwoInput.addEventListener("keyup", async (event) => {
  if (event.key !== "Enter") return;
  startButton.click();
});

document.addEventListener("keyup", (event) => {
  if (event.key !== "Enter" || gameSection.classList.contains('d-none')) return;
  sendButton.click();
});
