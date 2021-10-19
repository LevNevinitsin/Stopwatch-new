// Уведомление должно срабатывать раз в одну минуту
const FREQUENCY = 1;

const MARGIN = 1000;

const stopwatchNode = document.querySelector('.js-stopwatch');

const samplesButtons = stopwatchNode.querySelectorAll('.js-sound-sample');

const testSoundButton = stopwatchNode.querySelector('.js-test-sound');
const volumeNode = stopwatchNode.querySelector('.js-volume');

const predelayNode = stopwatchNode.querySelector('.js-predelay');
const timingNode = stopwatchNode.querySelector('.js-timing');

const timeNode = stopwatchNode.querySelector('.js-time');
const hoursNode = stopwatchNode.querySelector('.js-hours');
const minutesNode = stopwatchNode.querySelector('.js-minutes');
const secondsNode = stopwatchNode.querySelector('.js-seconds');
const millisecondsNode = stopwatchNode.querySelector('.js-milliseconds');

const startButton = stopwatchNode.querySelector('.js-start');
const resetButton = stopwatchNode.querySelector('.js-reset');

const audioNotification = new Audio('../audio/bell.wav');
audioNotification.volume = 0.1;

const myWorker = new Worker('js/worker.js');

let stopwatchInterval;
let timestamp;
let pauseTimestamp;
let timePassedOnPause = 0;

let predelayValue;
let predelayTemporary;

let timing;

let hasPlayedAudio = false;

const addZeroes = (number, neededLength) => ('0'.repeat(neededLength) + Math.abs(number).toString()).slice(-neededLength);

const rewriteTime = (date) => {
  timePassed = Date.now() - timestamp - timePassedOnPause - predelayValue;
  const isPositive = Math.sign(timePassed) >= 0;

  if (predelayTemporary) {
    timeNode.classList.add('stopwatch__time--negative');

    if (isPositive) {
      predelayTemporary = 0;
      timeNode.classList.remove('stopwatch__time--negative');
    }
  }

  millisecondsNode.textContent = addZeroes(Math.floor((timePassed % 1000) / 10), 2);

  const secondsCount = isPositive ? Math.floor(timePassed / 1000) % 60 : Math.ceil(timePassed / 1000) % 60;
  secondsNode.textContent = addZeroes(secondsCount, 2);

  let p1 = Math.abs(timePassed % (1000 * FREQUENCY * 60));
  const timingInMilliseconds = timing * 1000;

  console.log(`p1: ${p1}. Date: ${new Date().toLocaleTimeString()}`);

  if (timePassed > MARGIN && p1 > timingInMilliseconds && p1 < timingInMilliseconds + MARGIN) {
    if (!hasPlayedAudio) {
      audioNotification.play();
      hasPlayedAudio = true;
      console.log(`================ Audio played! ================ Time: ${new Date().toLocaleTimeString()}`);
    }
  } else {
    hasPlayedAudio = false;
  }

  minutesNode.textContent = addZeroes(isPositive ? Math.floor(timePassed / 60000) % 60 : Math.ceil(timePassed / 60000) % 60, 2);
  hoursNode.textContent = addZeroes(isPositive ? Math.floor(timePassed / 3600000) : Math.ceil(timePassed / 3600000) % 60, 2);
}

myWorker.onmessage = function(evt) {
  rewriteTime(evt.data);
}

const startCount = () => {
  // stopwatchInterval = setInterval(rewriteTime, 63);
  myWorker.postMessage({
    'message': 'start'
  });
  startButton.textContent = 'Stop';
}

const stopCount = () => {
  myWorker.postMessage({
    'message': 'stop'
  });
  startButton.textContent = 'Start';
}

const onSampleButtonChange = (evt) => {
  audioNotification.src = `../audio/${evt.target.value}.wav`;
  // audioNotification.load();
}

const onVolumeNodeChange = () => {
  const value = volumeNode.value;

  if (value > 100) {
    volumeNode.value = 100;
  }

  if (value < 0) {
    volumeNode.value = 0;
  }

  audioNotification.volume = parseInt(volumeNode.value, 10) / 100;
}

const onTestSoundButtonClick = () => {
  if (!audioNotification.paused || audioNotification.currentTime) {
    audioNotification.pause();
    audioNotification.currentTime = 0;
  }
  audioNotification.play();
}

const onStartButtonClick = () => {
  // Если первый запуск
  if (!stopwatchNode.classList.contains('stopwatch--active')) {
    predelayValue = predelayNode.value * 1000;
    predelayTemporary = predelayValue;
    console.log(`start! ${predelayTemporary}`);

    timing = timingNode.value;

    timestamp = Date.now();
    startCount();
    stopwatchNode.classList.add('stopwatch--active');
  } else {
    // Если снимаем с паузы
    if (stopwatchNode.classList.contains('stopwatch--paused')) {
      timePassedOnPause += Date.now() - pauseTimestamp;
      startCount();
      stopwatchNode.classList.remove('stopwatch--paused');
    // Если ставим на паузу
    } else {
      pauseTimestamp = Date.now();
      stopwatchNode.classList.add('stopwatch--paused');
      stopCount();
    }
  }
}

const onResetButtonClick = () => {
  hoursNode.textContent = '00';
  minutesNode.textContent = '00';
  secondsNode.textContent = '00';
  millisecondsNode.textContent = '00';

  timePassedOnPause = 0;
  stopwatchNode.classList.remove('stopwatch--active');
  stopCount();

  if (stopwatchNode.classList.contains('stopwatch--paused')) {
    stopwatchNode.classList.remove('stopwatch--paused');
  }

  if (timeNode.classList.contains('stopwatch__time--negative')) {
    timeNode.classList.remove('stopwatch__time--negative');
  }
}

samplesButtons.forEach((sampleButton) => {
  sampleButton.addEventListener('change', onSampleButtonChange);
})

volumeNode.addEventListener('change', onVolumeNodeChange)
testSoundButton.addEventListener('click', onTestSoundButtonClick);
startButton.addEventListener('click', onStartButtonClick);
resetButton.addEventListener('click', onResetButtonClick);
