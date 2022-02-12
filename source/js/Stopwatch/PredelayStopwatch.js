import { Util } from './../Util.js';
import { Stopwatch } from './Stopwatch.js';

class PredelayStopwatch extends Stopwatch {
  _PREDELAY_INPUT_SELECTOR     = '.js-predelay';
  _SAVE_DEFAULTS_NODE_SELECTOR = '.js-save-defaults';
  _LOAD_DEFAULTS_NODE_SELECTOR = '.js-load-defaults';
  _DEFAULTS                    = ['predelay'];
  _DEFAULTS_PREFIX             = 'predelay';

  _predelayInputNode;
  _predelay;

  _saveDefaultsNode;
  _loadDefaultsNode;
  _defaultsConfig;

  constructor(config) {
    super(config);
    this._predelayInputNode = this._stopwatchNode.querySelector(this._PREDELAY_INPUT_SELECTOR);
    this._saveDefaultsNode  = this._stopwatchNode.querySelector(this._SAVE_DEFAULTS_NODE_SELECTOR);
    this._loadDefaultsNode  = this._stopwatchNode.querySelector(this._LOAD_DEFAULTS_NODE_SELECTOR);
    this._setPredelay(this._predelayInputNode.value);

    this._predelayInputNode.addEventListener('change', (evt) => {
      this._setPredelay(evt.target.value);
    });

    this._saveDefaultsNode.addEventListener('click', () => {
      this._saveDefaults();
    });

    this._loadDefaultsNode.addEventListener('click', () => {
      this.loadDefaults();
    });
  }

  loadDefaults() {
    this._DEFAULTS.forEach((parameterName) => {
      Util.loadValueFromLocalStorage(this[`_${parameterName}InputNode`], parameterName, this._DEFAULTS_PREFIX);
    });
  }

  _processTime() {
    const now = Date.now();
    const timePassed = now - this._startTimestamp - this._predelay - this._timePassedOnPause;
    console.log(timePassed);

    this._clockFace.renderTime(timePassed);
  }

  _setPredelay(value) {
    this._predelay = Util.convertSecondsToMilliseconds(value);
  }

  _saveDefaults() {
    this._DEFAULTS.forEach((parameterName) => {
      localStorage.setItem(`${this._DEFAULTS_PREFIX}_${parameterName}`, this[`_${parameterName}InputNode`].value);
    });
  }
}

export { PredelayStopwatch }
