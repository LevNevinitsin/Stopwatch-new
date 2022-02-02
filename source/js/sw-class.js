import { Util } from './util.js';

class Stopwatch {
  #DEFAULT_WORKER_PATH = 'js/worker.js';
  #NEGATIVE_CLASS = 'stopwatch__time--negative';
  #GREEN_CLASS = 'stopwatch__time--green';
  #BLUE_CLASS = 'stopwatch__time--blue';
  #TRAINING_STATE_EXERCISE = 'exercise';
  #TRAINING_STATE_REST = 'rest';

  #alarmSound;

  #predelay;
  #isPositive;

  #alarmPeriod;
  #periodTimestamp;
  #referenceSecond;
  #pauseTimestamp;
  #timePassedOnPause;

  #stopwatchNode;
  #alarmPeriodNode;
  #exercisePeriodNode;
  #restPeriodNode;
  #timeNode;
  #hoursNode;
  #minutesNode;
  #secondsNode;
  #millisecondsNode;
  #startButtoNode;
  #startTimestamp;

  #isTrainingMode;
  #trainingState;
  #trainingPeriodsMap;
  #soundsMap;

  #refreshInterval;
  #worker;

  state;

  constructor(config) {
    this.#soundsMap          = config.soundsMap;
    this.#alarmSound         = new Audio(this.#soundsMap.bell);
    this.#alarmSound.volume  = parseInt(config.alarmVolume) / 100;

    this.#predelay           = parseInt(config.predelay) * 1000;
    this.#isPositive         = this.#predelay === 0;
    this.#alarmPeriodNode    = config.alarmPeriodNode;
    this.#exercisePeriodNode = config.exercisePeriodNode
    this.#restPeriodNode     = config.restPeriodNode
    this.#alarmPeriod        = parseFloat(config.alarmPeriod) * 1000;
    this.#periodTimestamp    = null;
    this.#referenceSecond    = parseInt(config.referenceSecond);
    this.#timePassedOnPause  = 0;

    this.#stopwatchNode      = config.stopwatchNode;
    this.#timeNode           = this.#stopwatchNode.querySelector('.js-time');
    this.#hoursNode          = this.#stopwatchNode.querySelector('.js-hours');
    this.#minutesNode        = this.#stopwatchNode.querySelector('.js-minutes');
    this.#secondsNode        = this.#stopwatchNode.querySelector('.js-seconds');
    this.#millisecondsNode   = this.#stopwatchNode.querySelector('.js-milliseconds');
    this.#startButtoNode     = this.#stopwatchNode.querySelector('.js-start');

    this.#isTrainingMode     = config.isTrainingMode;

    this.#worker             = new Worker(this.#DEFAULT_WORKER_PATH);
    this.#refreshInterval    = config.refreshInterval;
    this.#bindWorker();

    this.state = 'reset';

    this.#trainingPeriodsMap = {
      [this.#TRAINING_STATE_EXERCISE]: {
        length: parseFloat(config.exercisePeriod) * 1000,
        alarmSound: 'synth',
        colorClass: this.#BLUE_CLASS,
        nextState: this.#TRAINING_STATE_REST,
      },
      [this.#TRAINING_STATE_REST]: {
        length: parseFloat(config.restPeriod) * 1000,
        alarmSound: 'bell',
        colorClass: this.#GREEN_CLASS,
        nextState: this.#TRAINING_STATE_EXERCISE,
      },
    }

    if (this.#isTrainingMode) {
      this.#alarmPeriodNode.remove();
    } else {
      this.#exercisePeriodNode.remove();
      this.#restPeriodNode.remove();
    }
  }

  start() {
    if (this.state === 'reset') {
      this.#startTimestamp = Date.now();

      if (!this.#isPositive) {
        this.#timeNode.classList.add(this.#NEGATIVE_CLASS);
      }
    } else {
      const lastPauseDuration = Date.now() - this.#pauseTimestamp
      this.#timePassedOnPause += lastPauseDuration;

      if (this.#periodTimestamp) {
        this.#periodTimestamp += lastPauseDuration;
      }
    }

    this.state = 'counting';
    this.#startCount();
  }

  pause() {
    this.state = 'paused';
    this.#stopCount();
    this.#pauseTimestamp = Date.now();
  }

  reset() {
    this.state = 'reset';
    this.#stopCount();

    this.#hoursNode.textContent        = '00';
    this.#minutesNode.textContent      = '00';
    this.#secondsNode.textContent      = '00';
    this.#millisecondsNode.textContent = '00';

    this.#isPositive        = this.#predelay === 0;
    this.#timePassedOnPause = 0;
    this.#periodTimestamp   = null;

    if (this.#timeNode.classList.contains('stopwatch__time--negative')) {
      this.#timeNode.classList.remove('stopwatch__time--negative');
    }

    if (this.#isTrainingMode) {
      this.#timeNode.classList.remove(this.#trainingPeriodsMap[this.#trainingState].colorClass);
    }
  }

  testSound() {
    this.#playSound();
  }

  setAlarmSound(soundName) {
    this.#alarmSound.src = this.#soundsMap[soundName];
  }

  setVolume(value) {
    this.#alarmSound.volume = this.#processVolumeValue(value);
  }

  setPredelay(value) {
    this.#predelay = parseInt(value) * 1000;
  }

  setAlarmPeriod(value) {
    this.#alarmPeriod = parseFloat(value) * 1000;
  }

  setExercisePeriod(value) {
    this.#trainingPeriodsMap[this.#TRAINING_STATE_EXERCISE].length = parseFloat(value) * 1000;
  }

  setRestPeriod(value) {
    this.#trainingPeriodsMap[this.#TRAINING_STATE_REST].length = parseFloat(value) * 1000;
  }

  setReferenceSecond(value) {
    this.#referenceSecond = parseInt(value);
  }

  #bindWorker() {
    this.#worker.onmessage = () => {
      this.#processTime();
    }
  }

  #startCount = () => {
    this.#worker.postMessage({
      'message': 'start',
      'refreshInterval': this.#refreshInterval,
    });

    this.#startButtoNode.textContent = 'Stop';
  }

  #stopCount = () => {
    this.#worker.postMessage({
      'message': 'stop',
    });

    this.#startButtoNode.textContent = 'Start';
  }

  #processTime() {
    const now = Date.now();
    const timePassed = now - this.#startTimestamp - this.#predelay - this.#timePassedOnPause;
    console.log(timePassed, this.#trainingState, now - this.#periodTimestamp);

    this.#renderTime(timePassed);
    this.#handlePeriods(timePassed, now);
  }

  #renderTime(timePassed) {
    if (!this.#isPositive && timePassed >= 0) {
      this.#isPositive = true;
      this.#timeNode.classList.remove(this.#NEGATIVE_CLASS);
    }

    this.#millisecondsNode.textContent = Util.addZeroes(Math.floor((timePassed % 1000) / 10), 2);
    const totalSecondsCount = timePassed / 1000;
    const totalMinutesCount = timePassed / 60000;
    const totalHoursCount   = timePassed / 3600000;

    if (this.#isPositive) {
      this.#secondsNode.textContent = Util.addZeroes(Math.floor(totalSecondsCount) % 60, 2);
      this.#minutesNode.textContent = Util.addZeroes(Math.floor(totalMinutesCount) % 60, 2);
      this.#hoursNode.textContent   = Util.addZeroes(Math.floor(totalHoursCount), 2);
    } else {
      this.#secondsNode.textContent = Util.addZeroes(Math.ceil(totalSecondsCount) % 60, 2);
      this.#minutesNode.textContent = Util.addZeroes(Math.ceil(totalMinutesCount) % 60, 2);
      this.#hoursNode.textContent   = Util.addZeroes(Math.ceil(totalHoursCount), 2);
    }
  }

  #handlePeriods(timePassed, now) {
    const isTrainingMode = this.#isTrainingMode;

    if (!this.#periodTimestamp && timePassed > this.#referenceSecond * 1000) {
      this.#periodTimestamp = now - this.#refreshInterval * 1.5;

      if (isTrainingMode) {
        this.#trainingState = this.#TRAINING_STATE_EXERCISE;
        this.#timeNode.classList.add(this.#trainingPeriodsMap[this.#trainingState].colorClass);
      }

      if (this.#referenceSecond > 0) {
        this.#playSound();
      }
    }

    const currentPeriodLength = isTrainingMode
      ? this.#trainingPeriodsMap[this.#trainingState].length
      : this.#alarmPeriod;

    if (this.#periodTimestamp && now - this.#periodTimestamp > currentPeriodLength) {
      this.#periodTimestamp += currentPeriodLength;

      if (isTrainingMode) {
        this.#manageColor();
        this.#trainingState = this.#trainingPeriodsMap[this.#trainingState].nextState;
        this.setAlarmSound(this.#trainingPeriodsMap[this.#trainingState].alarmSound);
      }

      this.#playSound();
    }
  }

  #manageColor() {
    this.#timeNode.classList.remove(this.#trainingPeriodsMap[this.#trainingState].colorClass);
    const nextTrainingState = this.#trainingPeriodsMap[this.#trainingState].nextState;
    console.log(nextTrainingState);
    this.#timeNode.classList.add(this.#trainingPeriodsMap[nextTrainingState].colorClass);
  }

  #playSound() {
    if (this.#alarmSound.currentTime) {
      this.#alarmSound.currentTime = 0;
    }

    this.#alarmSound.play();
  }

  #processVolumeValue(value) {
    value = parseInt(value);

    if (value > 100) {
      value = 100;
    }

    if (value < 0) {
      value = 0;
    }

    return value / 100;
  }
}

export {
  Stopwatch
}
