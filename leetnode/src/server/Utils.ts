// Accurate decimal rounding
// https://stackoverflow.com/a/48764436/10928890
export const CustomMath = (function () {
  return {
    // Decimal round (half away from zero)
    round: function (num: number, decimalPlaces: number) {
      const p = Math.pow(10, decimalPlaces || 0);
      const n = num * p * (1 + Number.EPSILON);
      return Math.round(n) / p;
    },
    // Decimal ceil
    ceil: function (num: number, decimalPlaces: number) {
      const p = Math.pow(10, decimalPlaces || 0);
      const n = num * p * (1 - Math.sign(num) * Number.EPSILON);
      return Math.ceil(n) / p;
    },
    // Decimal floor
    floor: function (num: number, decimalPlaces: number) {
      const p = Math.pow(10, decimalPlaces || 0);
      const n = num * p * (1 + Math.sign(num) * Number.EPSILON);
      return Math.floor(n) / p;
    },
    // Decimal trunc
    trunc: function (num: number, decimalPlaces: number) {
      return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces);
    },
    // Format using fixed-point notation
    toFixed: function (num: number, decimalPlaces: number) {
      return this.round(num, decimalPlaces).toFixed(decimalPlaces);
    },
    // Random number between min and max (inclusive) with decimalPlaces
    random: function (min: number, max: number, decimalPlaces: number) {
      if (min == 0 && max == 0) return 0;
      return this.round(Math.random() * (max - min + 1) + min, decimalPlaces);
    },
  };
})();
