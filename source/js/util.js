class Util {
  static addZeroes(number, neededLength) {
    return ('0'.repeat(neededLength) + Math.abs(number).toString()).slice(-neededLength);
  }

  static convertSecondsToMilliseconds(value) {
    return Math.abs(parseFloat(value)) * 1000;
  }

  static loadValueFromLocalStorage(node, parameterName, parameterPrefix) {
    const storedValue = localStorage.getItem(`${parameterPrefix}_${parameterName}`);

    if (storedValue && node.value !== storedValue) {
      node.value = storedValue;
      node.dispatchEvent(new Event('change'));
    }
  }

  static findCheckedRadioInput(radioInputs) {
    return Array.from(radioInputs).find((radioInput) => {
      return radioInput.checked;
    });
  }

  static findRadioInputByValue(radioInputs, value) {
    return Array.from(radioInputs).find((radioInput) => {
      return radioInput.value === value;
    });
  }
}

export { Util };
