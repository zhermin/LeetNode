// Accurate decimal rounding
// https://stackoverflow.com/a/48764436/10928890
export const CustomMath = (function () {
  return {
    /** Decimal round (half away from zero) **/
    round: function (num: number, decimalPlaces: number) {
      const p = Math.pow(10, decimalPlaces || 0);
      const n = num * p * (1 + Number.EPSILON);
      return Math.round(n) / p;
    },
    /** Decimal ceil **/
    ceil: function (num: number, decimalPlaces: number) {
      const p = Math.pow(10, decimalPlaces || 0);
      const n = num * p * (1 - Math.sign(num) * Number.EPSILON);
      return Math.ceil(n) / p;
    },
    /** Decimal floor **/
    floor: function (num: number, decimalPlaces: number) {
      const p = Math.pow(10, decimalPlaces || 0);
      const n = num * p * (1 + Math.sign(num) * Number.EPSILON);
      return Math.floor(n) / p;
    },
    /** Decimal trunc **/
    trunc: function (num: number, decimalPlaces: number) {
      return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces);
    },
    /** Format using fixed-point notation **/
    toFixed: function (num: number, decimalPlaces: number) {
      return this.round(num, decimalPlaces).toFixed(decimalPlaces);
    },
    /** Random number between min and max with rounding to decimalPlaces **/
    random: function (min: number, max: number, decimalPlaces: number) {
      if (min == 0 && max == 0) return 0;
      return this.round(Math.random() * (max - min) + min, decimalPlaces);
    },
    /** Randomly shuffles an array **/
    shuffleArray: function (array: unknown[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    /** Selects the first n items from a shuffled array **/
    nRandomItems: function (array: unknown[], n: number) {
      const shuffled = this.shuffleArray(array);
      return shuffled.slice(0, n);
    },
    /** Generates an array of numbers between min and max with step **/
    generateRange: function (min: number, max: number, step: number) {
      const result = [];
      for (let i = -max; i <= max; i += step) {
        if (i === 0) continue;
        if (Math.abs(i) >= min && Math.abs(i) <= max) {
          result.push(i);
        }
      }
      return result;
    },
  };
})();
