import { Util } from './Util.js';

class ClockFace {
  #NEGATIVE_CLASS = 'stopwatch__clockface--negative';

  #clockFaceNode;
  #hoursNode;
  #minutesNode;
  #secondsNode;
  #millisecondsNode;
  _isMinusNeeded;

  constructor(clockFaceNode, isMinusNeeded = true) {
    this.#clockFaceNode    = clockFaceNode;
    this.#hoursNode        = this.#clockFaceNode.querySelector('.js-hours');
    this.#minutesNode      = this.#clockFaceNode.querySelector('.js-minutes');
    this.#secondsNode      = this.#clockFaceNode.querySelector('.js-seconds');
    this.#millisecondsNode = this.#clockFaceNode.querySelector('.js-milliseconds');
    this._isMinusNeeded    = isMinusNeeded;
  }

  renderTime(timePassed) {
    const isPositiveTime = timePassed >= 0;

    if (this.#clockFaceNode.classList.contains(this.#NEGATIVE_CLASS) && isPositiveTime) {
      this.#clockFaceNode.classList.remove(this.#NEGATIVE_CLASS);
    } else if (!this.#clockFaceNode.classList.contains(this.#NEGATIVE_CLASS) && !isPositiveTime && this._isMinusNeeded) {
      this.#clockFaceNode.classList.add(this.#NEGATIVE_CLASS);
    }

    this.#millisecondsNode.textContent = Util.addZeroes(Math.floor((timePassed % 1000) / 10), 2);
    const totalSecondsCount = timePassed / 1000;
    const totalMinutesCount = timePassed / 60000;
    const totalHoursCount   = timePassed / 3600000;

    if (isPositiveTime) {
      this.#secondsNode.textContent = Util.addZeroes(Math.floor(totalSecondsCount) % 60, 2);
      this.#minutesNode.textContent = Util.addZeroes(Math.floor(totalMinutesCount) % 60, 2);
      this.#hoursNode.textContent   = Util.addZeroes(Math.floor(totalHoursCount), 2);
    } else {
      this.#secondsNode.textContent = Util.addZeroes(Math.ceil(totalSecondsCount) % 60, 2);
      this.#minutesNode.textContent = Util.addZeroes(Math.ceil(totalMinutesCount) % 60, 2);
      this.#hoursNode.textContent   = Util.addZeroes(Math.ceil(totalHoursCount), 2);
    }
  }

  reset() {
    this.#hoursNode.textContent        = '00';
    this.#minutesNode.textContent      = '00';
    this.#secondsNode.textContent      = '00';
    this.#millisecondsNode.textContent = '00';

    if (this.#clockFaceNode.classList.contains(this.#NEGATIVE_CLASS)) {
      this.#clockFaceNode.classList.remove(this.#NEGATIVE_CLASS);
    }
  }
}

export { ClockFace }
