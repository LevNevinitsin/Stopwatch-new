import { Util }              from '../Util.js';
import { ClockFace }         from '../Clockface.js';
import { Alarmer }           from '../Alarmer.js';
import { PredelayStopwatch } from './PredelayStopwatch.js';

class TrainingStopwatch extends PredelayStopwatch {
  _EXERCISE_CLOCK_FACE_NODE_SELECTOR       = '.js-exercise-clockface';
  _REST_CLOCK_FACE_NODE_SELECTOR           = '.js-rest-clockface';
  _EXERCISE_PERIOD_CONTAINER_NODE_SELECTOR = '.js-exercise-period';
  _EXERCISE_PERIOD_INPUT_SELECTOR          = '.js-exercise-period-input';
  _REST_PERIOD_INPUT_SELECTOR              = '.js-rest-period-input';
  _EXERCISE_ALARMER_NODE_SELECTOR          = '.js-exercise-alarmer';
  _REST_ALARMER_NODE_SELECTOR              = '.js-rest-alarmer';
  _DEFAULTS                                = ['predelay', 'exercisePeriod', 'restPeriod'];
  _DEFAULTS_PREFIX                         = 'training';
  _EXERCISE_MODES_INPUTS_SELECTOR          = '.js-exercise-mode-input';
  _FINISH_EXERCISE_NODE_SELECTOR           = '.js-finish-exercise';
  _EXERCISE_PERIOD_DISABLED_CLASS          = 'stopwatch__control--disabled';

  _exerciseClockFaceNode;
  _restClockFaceNode;
  _exercisePeriodContainerNode;
  _exercisePeriodInputNode;
  _restPeriodInputNode;
  _exerciseAlarmerNode;
  _restAlarmerNode;

  _exerciseClockFace;
  _restClockFace;
  _exercisePeriod;
  _restPeriod;

  _currentPeriodName;
  _periodTimestamp;
  _periodsMap;

  _exerciseAlarmer;
  _restAlarmer;

  _exerciseModesInputs;
  _exerciseMode;
  _finishExerciseNode;

  constructor(config) {
    super(config);

    this._exerciseClockFaceNode       = this._stopwatchNode.querySelector(this._EXERCISE_CLOCK_FACE_NODE_SELECTOR);
    this._restClockFaceNode           = this._stopwatchNode.querySelector(this._REST_CLOCK_FACE_NODE_SELECTOR);
    this._exercisePeriodContainerNode = this._stopwatchNode.querySelector(this._EXERCISE_PERIOD_CONTAINER_NODE_SELECTOR);
    this._exercisePeriodInputNode     = this._stopwatchNode.querySelector(this._EXERCISE_PERIOD_INPUT_SELECTOR);
    this._restPeriodInputNode         = this._stopwatchNode.querySelector(this._REST_PERIOD_INPUT_SELECTOR);
    this._exerciseAlarmerNode         = this._stopwatchNode.querySelector(this._EXERCISE_ALARMER_NODE_SELECTOR);
    this._restAlarmerNode             = this._stopwatchNode.querySelector(this._REST_ALARMER_NODE_SELECTOR);
    this._exerciseModesInputs         = this._stopwatchNode.querySelectorAll(this._EXERCISE_MODES_INPUTS_SELECTOR);
    this._finishExerciseNode          = this._stopwatchNode.querySelector(this._FINISH_EXERCISE_NODE_SELECTOR);

    this._exerciseClockFace = new ClockFace(this._exerciseClockFaceNode, false);
    this._restClockFace     = new ClockFace(this._restClockFaceNode, false);
    this._exerciseAlarmer   = new Alarmer(this._exerciseAlarmerNode);
    this._restAlarmer       = new Alarmer(this._restAlarmerNode);

    this._periodsMap = {
      'exercise': {
        duration: Util.convertSecondsToMilliseconds(this._exercisePeriodInputNode.value),
        clockFace: this._exerciseClockFace,
        alarmer: this._exerciseAlarmer,
        nextPeriodName: 'rest',
      },
      'rest': {
        duration: Util.convertSecondsToMilliseconds(this._restPeriodInputNode.value),
        clockFace: this._restClockFace,
        alarmer: this._restAlarmer,
        nextPeriodName: 'exercise',
      },
    }

    this._exerciseMode = Util.findCheckedRadioInput(this._exerciseModesInputs).value;
    this._changeExerciseMode(this._exerciseMode);

    this._loadAlarmersAndExerciseModeDefaults();

    this._loadDefaultsNode.addEventListener('click', () => {
      this._loadAlarmersAndExerciseModeDefaults();
    });

    this._exercisePeriodInputNode.addEventListener('change', (evt) => {
      this._setExercisePeriod(evt.target.value);
    });

    this._restPeriodInputNode.addEventListener('change', (evt) => {
      this._setRestPeriod(evt.target.value);
    });

    this._exerciseModesInputs.forEach((exerciseModeInput) => {
      exerciseModeInput.addEventListener('change', (evt) => {
        this._changeExerciseMode(evt.target.value);
      });
    });

    this._finishExerciseNode.addEventListener('click', () => {
      this._onFinishExerciseNodeClick();
    });
  }

  _start() {
    if (this._state === 'reset') {
      this._startTimestamp = Date.now();
    } else {
      const lastPauseDuration = Date.now() - this._pauseTimestamp;
      this._timePassedOnPause += lastPauseDuration;

      if (this._periodTimestamp) {
        this._periodTimestamp += lastPauseDuration;
      }

      if (this._exerciseMode === 'manual') {
        this._disableExerciseAutoModeOption();
      }
    }

    this._state = 'counting';
    this._startCount();
  }

  _pause() {
    super._pause();

    if (this._exerciseMode === 'manual' && this._currentPeriodName === 'exercise') {
      this._enableExerciseAutoModeOption();
    }
  }

  _reset() {
    super._reset();
    this._periodTimestamp = null;
    this._currentPeriodName = 'exercise';
    this._resetPeriodsClockFaces();

    if (this._exerciseMode === 'manual' && this._currentPeriodName === 'exercise') {
      this._enableExerciseAutoModeOption();
    }
  }

  _setExercisePeriod(value) {
    this._periodsMap.exercise.duration = Util.convertSecondsToMilliseconds(value);
  }

  _setRestPeriod(value) {
    this._periodsMap.rest.duration = Util.convertSecondsToMilliseconds(value);
  }

  _processTime() {
    const now = Date.now();
    const timePassed = now - this._startTimestamp - this._predelay - this._timePassedOnPause;
    console.log(timePassed);

    this._clockFace.renderTime(timePassed);

    if (timePassed >= 0) {
      this._handlePeriods(now);
      return;
    }

    if (this._periodTimestamp) {
      this._periodTimestamp = null;
      this._resetPeriodsClockFaces();
    }
  }

  _handlePeriods(now) {
    if (!this._periodTimestamp) {
      this._periodTimestamp = now - this._refreshInterval;
      this._currentPeriodName = 'exercise';
      this._periodsMap.exercise.alarmer.playSound();

      if (this._exerciseMode === 'manual') {
        this._finishExerciseNode.disabled = false;
        this._disableExerciseAutoModeOption();
      }

      return;
    }

    const currentPeriodName = this._currentPeriodName;
    const currentPeriod = this._periodsMap[currentPeriodName];
    const currentPeriodDuration = currentPeriod.duration;

    if (this._exerciseMode === 'manual') {
      const isCurrentPeriodExercise = currentPeriodName === 'exercise';
      const periodTimePassed = isCurrentPeriodExercise
        ? now - this._periodTimestamp
        : now - this._periodTimestamp - currentPeriodDuration;

      currentPeriod.clockFace.renderTime(periodTimePassed);

      if (!isCurrentPeriodExercise && periodTimePassed > 0) {
        this._swtichPeriod(currentPeriod, currentPeriodDuration);
        this._finishExerciseNode.disabled = false;
        this._disableExerciseAutoModeOption();
      }
    } else {
      const periodTimePassed = now - this._periodTimestamp - currentPeriodDuration;
      currentPeriod.clockFace.renderTime(periodTimePassed);

      if (periodTimePassed > 0) {
        this._swtichPeriod(currentPeriod, currentPeriodDuration);
      }
    }
  }

  _resetPeriodsClockFaces() {
    Object.values(this._periodsMap).forEach((periodConfig) => {
      periodConfig.clockFace.reset();
    });
  }

  _saveDefaults() {
    super._saveDefaults();

    Object.entries(this._periodsMap).forEach(([alarmerName, periodProperties]) => {
      periodProperties.alarmer.saveDefaults(alarmerName);
    });

    localStorage.setItem(`${this._DEFAULTS_PREFIX}_exerciseMode`, this._exerciseMode);
  }

  _loadAlarmersAndExerciseModeDefaults() {
    this._loadAlarmersDefaults();
    this._loadExerciseModeDefault();
  }

  _loadAlarmersDefaults() {
    Object.entries(this._periodsMap).forEach(([alarmerName, periodProperties]) => {
      periodProperties.alarmer.loadDefaults(alarmerName);
    });
  }

  _loadExerciseModeDefault() {
    const defaultExerciseMode = localStorage.getItem(`${this._DEFAULTS_PREFIX}_exerciseMode`);
    const neededExerciseModeInput = Util.findRadioInputByValue(this._exerciseModesInputs, defaultExerciseMode);

    if (neededExerciseModeInput && neededExerciseModeInput.checked === false) {
      neededExerciseModeInput.checked = true;
      neededExerciseModeInput.dispatchEvent(new Event('change'));
    }
  }

  _changeExerciseMode(modeName) {
    this._exerciseMode = modeName;

    if (modeName === 'manual') {
      this._exercisePeriodInputNode.disabled = true;
      this._exercisePeriodContainerNode.classList.add(this._EXERCISE_PERIOD_DISABLED_CLASS);
    } else {
      this._exercisePeriodInputNode.disabled = false;
      this._exercisePeriodContainerNode.classList.remove(this._EXERCISE_PERIOD_DISABLED_CLASS);
    }
  }

  _onFinishExerciseNodeClick() {
    const periodTimePassed = Date.now() - this._periodTimestamp;
    const currentPeriod = this._periodsMap[this._currentPeriodName];
    this._swtichPeriod(currentPeriod, periodTimePassed);
    this._finishExerciseNode.disabled = true;
    this._enableExerciseAutoModeOption();
  }

  _swtichPeriod(currentPeriod, currentPeriodDuration) {
    this._periodTimestamp += currentPeriodDuration;
    currentPeriod.clockFace.reset();
    this._currentPeriodName = currentPeriod.nextPeriodName;
    this._periodsMap[this._currentPeriodName].alarmer.playSound();
  }

  _enableExerciseAutoModeOption() {
    Util.findRadioInputByValue(this._exerciseModesInputs, 'auto').disabled = false;
  }

  _disableExerciseAutoModeOption() {
    Util.findRadioInputByValue(this._exerciseModesInputs, 'auto').disabled = true;
  }
}

export { TrainingStopwatch }

