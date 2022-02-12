import { Util }              from './../Util.js';
import { Alarmer }           from './../Alarmer.js';
import { PredelayStopwatch } from './PredelayStopwatch.js';

class AlarmStopwatch extends PredelayStopwatch {
  _ALARMER_NODE_SELECTOR           = '.js-alarmer';
  _ALARM_PERIOD_INPUT_SELECTOR     = '.js-alarm-period';
  _REFERENCE_SECOND_INPUT_SELECTOR = '.js-reference-second';
  _DEFAULTS                        = ['predelay', 'alarmPeriod', 'referenceSecond'];
  _DEFAULTS_PREFIX                 = 'alarm';
  _ALARMER_NAME                    = 'alarm';

  _alarmPeriodInputNode;
  _referenceSecondInputNode;
  _alarmPeriod;
  _periodTimestamp;
  _referenceSecond;

  _alarmerNode;
  _alarmer;

  constructor(config) {
    super(config);

    this._alarmerNode              = this._stopwatchNode.querySelector(this._ALARMER_NODE_SELECTOR);
    this._alarmPeriodInputNode     = this._stopwatchNode.querySelector(this._ALARM_PERIOD_INPUT_SELECTOR);
    this._referenceSecondInputNode = this._stopwatchNode.querySelector(this._REFERENCE_SECOND_INPUT_SELECTOR);
    this._setAlarmPeriod(this._alarmPeriodInputNode.value);
    this._setReferenceSecond(this._referenceSecondInputNode.value);

    this._alarmPeriodInputNode.addEventListener('change', (evt) => {
      this._setAlarmPeriod(evt.target.value);
    });

    this._referenceSecondInputNode.addEventListener('change', (evt) => {
      this._setReferenceSecond(evt.target.value);
    });

    this._alarmer = new Alarmer(this._alarmerNode);
  }

  loadDefaults() {
    super.loadDefaults();
    this._alarmer.loadDefaults(this._ALARMER_NAME);
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
    }

    this._state = 'counting';
    this._startCount();
  }

  _reset() {
    super._reset();
    this._periodTimestamp = null;
  }

  _setAlarmPeriod(value) {
    this._alarmPeriod = Util.convertSecondsToMilliseconds(value);
  }

  _setReferenceSecond(value) {
    this._referenceSecond = Math.abs(value);
  }

  _processTime() {
    const now = Date.now();
    const timePassed = now - this._startTimestamp - this._predelay - this._timePassedOnPause;
    console.log(timePassed);

    this._clockFace.renderTime(timePassed);

    if (timePassed >= this._referenceSecond * 1000) {
      this._handlePeriod(now);
      return;
    }

    if (this._periodTimestamp) {
      this._periodTimestamp = null;
    }
  }

  _handlePeriod(now) {
    if (!this._periodTimestamp) {
      this._periodTimestamp = now - this._refreshInterval; // Отнимаем this._refreshInterval, чтобы не было микро-запаздывания
      this._alarmer.playSound();
    }

    if (this._periodTimestamp && now - this._periodTimestamp > this._alarmPeriod) {
      this._periodTimestamp += this._alarmPeriod;
      this._alarmer.playSound();;
    }
  }

  _saveDefaults() {
    super._saveDefaults();
    this._alarmer.saveDefaults(this._ALARMER_NAME);
  }
}

export { AlarmStopwatch }
