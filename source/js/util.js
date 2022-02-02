class Util {
  static addZeroes(number, neededLength) {
    return ('0'.repeat(neededLength) + Math.abs(number).toString()).slice(-neededLength);
  }
}

export { Util };
