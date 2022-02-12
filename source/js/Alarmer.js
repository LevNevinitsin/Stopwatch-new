import { Util } from "./Util.js";

class Alarmer {
  #AUDIO_FOLDER_NAME = 'audio';

  #ALARM_SOUND_SAMPLE_INPUT_SELECTOR = '.js-sound-sample';
  #ALARM_VOLUME_INPUT_SELECTOR       = '.js-volume';
  #ALARM_TEST_SOUND_SELECTOR         = '.js-test-sound';

  #alarm;
  #alarmSoundSamplesInputsNodes;
  #alarmVolumeInputNode;
  #alarmTestSoundNode;

  constructor(alarmerNode) {
    this.#alarmSoundSamplesInputsNodes = alarmerNode.querySelectorAll(this.#ALARM_SOUND_SAMPLE_INPUT_SELECTOR);
    this.#alarmVolumeInputNode         = alarmerNode.querySelector(this.#ALARM_VOLUME_INPUT_SELECTOR);
    this.#alarmTestSoundNode           = alarmerNode.querySelector(this.#ALARM_TEST_SOUND_SELECTOR);

    const chosenSample = Util.findCheckedRadioInput(this.#alarmSoundSamplesInputsNodes).value;

    this.#alarm = new Audio(this.#generateAudioSamplePath(chosenSample));
    this.#setAlarmVolume(this.#alarmVolumeInputNode.value);

    this.#alarmSoundSamplesInputsNodes.forEach((soundSampleInputNode) => {
      soundSampleInputNode.addEventListener('change', (evt) => {
        this.#setAlarmSample(evt.target.value);
      });
    });

    this.#alarmVolumeInputNode.addEventListener('change', (evt) => {
      this.#setAlarmVolume(evt.target.value);
    });

    this.#alarmTestSoundNode.addEventListener('click', () => {
      this.playSound();
    });
  }

  playSound() {
    if (this.#alarm.currentTime) {
      this.#alarm.currentTime = 0;
    }

    this.#alarm.play();
  }

  saveDefaults(alarmerName) {
    localStorage.setItem(`${alarmerName}SoundSampleName`, this.#getAlarmSampleName());
    localStorage.setItem(`${alarmerName}_alarmVolume`, this.#alarmVolumeInputNode.value);
  }

  loadDefaults(alarmerName) {
    this.#setAlarmSampleFromDefault(localStorage.getItem(`${alarmerName}SoundSampleName`));
    Util.loadValueFromLocalStorage(this.#alarmVolumeInputNode, 'alarmVolume', alarmerName);
  }

  #getAlarmSampleName() {
    const regex = /.+\/(.+)\..{3}/;
    return this.#alarm.src.match(regex)[1];
  }

  #setAlarmSampleFromDefault(sampleName) {
    const neededSampleInput = Util.findRadioInputByValue(this.#alarmSoundSamplesInputsNodes, sampleName);

    if (neededSampleInput && neededSampleInput.checked === false) {
      neededSampleInput.checked = true;
      neededSampleInput.dispatchEvent(new Event('change'));
    }
  }

  #setAlarmSample(value) {
    this.#alarm.src = this.#generateAudioSamplePath(value);
  }

  #generateAudioSamplePath(sampleName) {
    return `${this.#AUDIO_FOLDER_NAME}/${sampleName}.mp3`;
  }

  #setAlarmVolume(value) {
    this.#alarm.volume = this.#processVolumeValue(value);
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

export { Alarmer }

