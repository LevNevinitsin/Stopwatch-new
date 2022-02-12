import { ClockFace } from '../Clockface.js';

class Stopwatch {
  _DEFAULT_REFRESH_INTERVAL = 41;
  _DEFAULT_WORKER_PATH      = 'js/worker.js';

  _CLOCK_FACE_NODE_SELECTOR = '.js-clockface';
  _START_BUTTON_SELECTOR = '.js-start';
  _RESET_BUTTON_SELECTOR = '.js-reset';

  _state;

  _stopwatchNode;
  _clockFaceNode;
  _startButtonNode;
  _resetButtonNode;

  _startTimestamp;
  _pauseTimestamp;
  _timePassedOnPause;

  _clockFace;

  _refreshInterval;
  _worker;

  constructor(config) {
    this._refreshInterval = config?.refreshInterval ?? this._DEFAULT_REFRESH_INTERVAL;
    this._stopwatchNode   = config.stopwatchNode;
    this._clockFaceNode   = this._stopwatchNode.querySelector(this._CLOCK_FACE_NODE_SELECTOR);
    this._startButtonNode = this._stopwatchNode.querySelector(this._START_BUTTON_SELECTOR);
    this._resetButtonNode = this._stopwatchNode.querySelector(this._RESET_BUTTON_SELECTOR);
    this._timePassedOnPause = 0;
    this._state = 'reset';
    this._worker = new Worker(this._DEFAULT_WORKER_PATH);
    this._bindMessageFromWorker();

    this._clockFace = new ClockFace(this._clockFaceNode);

    this._startButtonNode.addEventListener('click', () => {
      this._state !== 'counting' ? this._start() : this._pause();
    });

    this._resetButtonNode.addEventListener('click', () => {
      this._reset();
    });
  }

  _start() {
    if (this._state === 'reset') {
      this._startTimestamp = Date.now();
    } else {
      const lastPauseDuration = Date.now() - this._pauseTimestamp;
      this._timePassedOnPause += lastPauseDuration;
    }

    this._state = 'counting';
    this._startCount();
  }

  _pause() {
    this._state = 'paused';
    this._stopCount();
    this._pauseTimestamp = Date.now();
  }

  _reset() {
    this._state = 'reset';
    this._stopCount();
    this._clockFace.reset();
    this._timePassedOnPause = 0;
  }

  _startCount() {
    this._worker.postMessage({
      'message': 'start',
      'refreshInterval': this._refreshInterval,
    });

    this._startButtonNode.textContent = 'Pause';
  }

  _stopCount() {
    this._worker.postMessage({
      'message': 'stop',
    });

    this._startButtonNode.textContent = 'Start';
  }

  _bindMessageFromWorker() {
    this._worker.onmessage = () => {
      this._processTime();
    }
  }

  _processTime() {
    const now = Date.now();
    const timePassed = now - this._startTimestamp - this._timePassedOnPause;
    console.log(timePassed);

    this._clockFace.renderTime(timePassed);
  }
}

export  { Stopwatch }

