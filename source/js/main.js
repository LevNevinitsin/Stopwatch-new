import { Switcher }          from './Switcher.js';
import { Stopwatch }         from './Stopwatch/Stopwatch.js';
import { PredelayStopwatch } from './Stopwatch/PredelayStopwatch.js';
import { AlarmStopwatch }    from './Stopwatch/AlarmStopwatch.js';
import { TrainingStopwatch } from './Stopwatch/TrainingStopwatch.js';

const switcherNode = document.querySelector('.js-switcher');
const switcherConfig = { switcherNode: switcherNode };

new Switcher(switcherConfig);

const basicStopwatchNode    = document.querySelector('.js-stopwatch[data-stopwatch-type="basic"]');
const predelayStopwatchNode = document.querySelector('.js-stopwatch[data-stopwatch-type="predelay"]');
const alarmStopwatchNode    = document.querySelector('.js-stopwatch[data-stopwatch-type="alarm"]');
const trainingStopwatchNode = document.querySelector('.js-stopwatch[data-stopwatch-type="training"]');

const basicStopwatchConfig    = { stopwatchNode: basicStopwatchNode };
const predelayStopwatchConfig = { stopwatchNode: predelayStopwatchNode };
const alarmStopwatchConfig    = { stopwatchNode: alarmStopwatchNode };
const trainingStopwatchConfig = { stopwatchNode: trainingStopwatchNode };

new Stopwatch(basicStopwatchConfig);
new PredelayStopwatch(predelayStopwatchConfig);
new AlarmStopwatch(alarmStopwatchConfig);
new TrainingStopwatch(trainingStopwatchConfig);

localStorage.clear();
