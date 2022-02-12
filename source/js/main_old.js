import { Stopwatch } from "./Stopwatch/Stopwatch.js";

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
const saveDefaultsButtonNode  = stopwatchNode.querySelector('.js-save-defaults');
const loadDefaultsButtonNode  = stopwatchNode.querySelector('.js-load-defaults');
const startButton             = stopwatchNode.querySelector('.js-start');
const resetButton             = stopwatchNode.querySelector('.js-reset');

console.log(localStorage.getItem('exercisePeriod'));

const stopwatchConfig = {
  refreshInterval    : 42,
  isTrainingMode     : true,
  stopwatchNode      : stopwatchNode,
  alarmVolume        : localStorage.getItem('volume')          ?? volumeNode.value,
  predelay           : localStorage.getItem('predelay')        ?? predelayNode.value,
  alarmPeriod        : localStorage.getItem('alarmPeriod')     ?? alarmPeriodInputNode.value,
  alarmPeriodNode    : alarmPeriodNode,
  exercisePeriod     : localStorage.getItem('exercisePeriod')  ?? exercisePeriodInputNode.value,
  exercisePeriodNode : exercisePeriodNode,
  restPeriod         : localStorage.getItem('restPeriod')      ?? restPeriodInputNode.value,
  restPeriodNode     : restPeriodNode,
  referenceSecond    : localStorage.getItem('referenceSecond') ?? referenceSecondNode.value,
  soundsMap          : soundsMap,
};

const stopwatch = new Stopwatch(stopwatchConfig);
stopwatch.loadDefaults(volumeNode, predelayNode, alarmPeriodNode, exercisePeriodInputNode, restPeriodInputNode, referenceSecondNode);

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
saveDefaultsButtonNode.addEventListener('click', onSaveDefaultsButtonNodeClick);
loadDefaultsButtonNode.addEventListener('click', onLoadDefaultsButtonNodeClick);

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

function onSaveDefaultsButtonNodeClick() {
  stopwatch.saveDefaults(volumeNode, predelayNode, alarmPeriodNode, exercisePeriodInputNode, restPeriodInputNode, referenceSecondNode);
}

function onLoadDefaultsButtonNodeClick() {
  stopwatch.loadDefaults(volumeNode, predelayNode, alarmPeriodNode, exercisePeriodInputNode, restPeriodInputNode, referenceSecondNode);
}

function onStartButtonClick() {
  stopwatch.state !== 'counting' ? stopwatch.start() : stopwatch.pause();
}

function onResetButtonClick() {
  stopwatch.reset();
}
