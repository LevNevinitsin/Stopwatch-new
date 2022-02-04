import { Stopwatch } from "./sw-class.js";

const soundsMap = {
  'bell': 'audio/bell.mp3',
  'synth': 'audio/synth2.mp3',
}

const stopwatchNode           = document.querySelector('.js-stopwatch');
const samplesButtons          = stopwatchNode.querySelectorAll('.js-sound-sample');
const volumeNode              = stopwatchNode.querySelector('.js-volume');
const testSoundButton         = stopwatchNode.querySelector('.js-test-sound');
const predelayNode            = stopwatchNode.querySelector('.js-predelay');
const alarmPeriodNode         = stopwatchNode.querySelector('.js-alarm-period');
const alarmPeriodInputNode    = stopwatchNode.querySelector('.js-alarm-period-input');
const exercisePeriodNode      = stopwatchNode.querySelector('.js-exercise-period');
const exercisePeriodInputNode = stopwatchNode.querySelector('.js-exercise-period-input');
const restPeriodNode          = stopwatchNode.querySelector('.js-rest-period');
const restPeriodInputNode     = stopwatchNode.querySelector('.js-rest-period-input');
const referenceSecondNode     = stopwatchNode.querySelector('.js-reference-second');
const startButton             = stopwatchNode.querySelector('.js-start');
const resetButton             = stopwatchNode.querySelector('.js-reset');

const stopwatchConfig = {
  alarmPeriod        : alarmPeriodInputNode.value,
  exercisePeriod     : exercisePeriodInputNode.value,
  restPeriod         : restPeriodInputNode.value,
  referenceSecond    : referenceSecondNode.value,
  alarmVolume        : volumeNode.value,
  predelay           : predelayNode.value,
  isTrainingMode     : true,
  refreshInterval    : 41,
  stopwatchNode      : stopwatchNode,
  alarmPeriodNode    : alarmPeriodNode,
  exercisePeriodNode : exercisePeriodNode,
  restPeriodNode     : restPeriodNode,
  soundsMap          : soundsMap,
};

const stopwatch = new Stopwatch(stopwatchConfig);

samplesButtons.forEach((sampleButton) => {
  sampleButton.addEventListener('change', onSampleButtonChange);
});
volumeNode.addEventListener('change', onVolumeNodeChange);
testSoundButton.addEventListener('click', onTestSoundButtonClick);

predelayNode.addEventListener('change', onPredelayNodeChange);
alarmPeriodInputNode.addEventListener('change', onAlarmPeriodInputNodeChange);
exercisePeriodInputNode.addEventListener('change', onExercisePeriodInputNodeChange);
restPeriodInputNode.addEventListener('change', onRestPeriodInputNodeChange);
referenceSecondNode.addEventListener('change', onReferenceSecondNodeChange);

startButton.addEventListener('click', onStartButtonClick);
resetButton.addEventListener('click', onResetButtonClick);

function onSampleButtonChange(evt) {
  stopwatch.setAlarmSound(evt.target.value);
}

function onVolumeNodeChange() {
  stopwatch.setVolume(this.value);
}

function onTestSoundButtonClick() {
  stopwatch.testSound();
}

function onPredelayNodeChange() {
  stopwatch.setPredelay(this.value);
}

function onReferenceSecondNodeChange() {
  stopwatch.setReferenceSecond(this.value);
}

function onAlarmPeriodInputNodeChange() {
  stopwatch.setAlarmPeriod(this.value);
}

function onExercisePeriodInputNodeChange() {
  stopwatch.setExercisePeriod(this.value);
}

function onRestPeriodInputNodeChange() {
  stopwatch.setRestPeriod(this.value);
}

function onStartButtonClick() {
  stopwatch.state !== 'counting' ? stopwatch.start() : stopwatch.pause();
}

function onResetButtonClick() {
  stopwatch.reset();
}
