'use strict';

var _ = require('lodash');

var errors = require('./errors');
var $ = require('./util/preconditions');

var UNITS = {
  'EXCC'      : [1e8, 8],
  'mEXCC'     : [1e5, 5],
  'uEXCC'     : [1e2, 2],
  'bits'     : [1e2, 2],
  'dbits'    : [1e2, 2],
  'exels'    : [1, 0]
};

/**
 * Utility for handling and converting bitcoins units. The supported units are
 * EXCC, mEXCC, bits (also named uEXCC) and exels. A unit instance can be created with an
 * amount and a unit code, or alternatively using static methods like {fromEXCC}.
 * It also allows to be created from a fiat amount and the exchange rate, or
 * alternatively using the {fromFiat} static method.
 * You can consult for different representation of a unit instance using it's
 * {to} method, the fixed unit methods like {toSatoshis} or alternatively using
 * the unit accessors. It also can be converted to a fiat amount by providing the
 * corresponding EXCC/fiat exchange rate.
 *
 * @example
 * ```javascript
 * var sats = Unit.fromEXCC(1.3).toSatoshis();
 * var mili = Unit.fromBits(1.3).to(Unit.mEXCC);
 * var bits = Unit.fromFiat(1.3, 350).bits;
 * var excc = new Unit(1.3, Unit.bits).EXCC;
 * ```
 *
 * @param {Number} amount - The amount to be represented
 * @param {String|Number} code - The unit of the amount or the exchange rate
 * @returns {Unit} A new instance of an Unit
 * @constructor
 */
function Unit(amount, code) {
  if (!(this instanceof Unit)) {
    return new Unit(amount, code);
  }

  // convert fiat to EXCC
  if (_.isNumber(code)) {
    if (code <= 0) {
      throw new errors.Unit.InvalidRate(code);
    }
    amount = amount / code;
    code = Unit.EXCC;
  }

  this._value = this._from(amount, code);

  var self = this;
  var defineAccesor = function(key) {
    Object.defineProperty(self, key, {
      get: function() { return self.to(key); },
      enumerable: true,
    });
  };

  Object.keys(UNITS).forEach(defineAccesor);
}

Object.keys(UNITS).forEach(function(key) {
  Unit[key] = key;
});

/**
 * Returns a Unit instance created from JSON string or object
 *
 * @param {String|Object} json - JSON with keys: amount and code
 * @returns {Unit} A Unit instance
 */
Unit.fromObject = function fromObject(data){
  $.checkArgument(_.isObject(data), 'Argument is expected to be an object');
  return new Unit(data.amount, data.code);
};

/**
 * Returns a Unit instance created from an amount in EXCC
 *
 * @param {Number} amount - The amount in EXCC
 * @returns {Unit} A Unit instance
 */
Unit.fromEXCC = function(amount) {
  return new Unit(amount, Unit.EXCC);
};

/**
 * Returns a Unit instance created from an amount in mEXCC
 *
 * @param {Number} amount - The amount in mEXCC
 * @returns {Unit} A Unit instance
 */
Unit.fromMillis = Unit.fromMilis = function(amount) {
  return new Unit(amount, Unit.mEXCC);
};

/**
 * Returns a Unit instance created from an amount in dbits
 *
 * @param {Number} amount - The amount in dbits
 * @returns {Unit} A Unit instance
 */
Unit.fromMicros = Unit.fromDbits = function(amount) {
  return new Unit(amount, Unit.dbits);
};

/**
 * Returns a Unit instance created from an amount in exels
 *
 * @param {Number} amount - The amount in exels
 * @returns {Unit} A Unit instance
 */
Unit.fromExels = function(amount) {
  return new Unit(amount, Unit.exels);
};

/**
 * Returns a Unit instance created from a fiat amount and exchange rate.
 *
 * @param {Number} amount - The amount in fiat
 * @param {Number} rate - The exchange rate EXCC/fiat
 * @returns {Unit} A Unit instance
 */
Unit.fromFiat = function(amount, rate) {
  return new Unit(amount, rate);
};

Unit.prototype._from = function(amount, code) {
  if (!UNITS[code]) {
    throw new errors.Unit.UnknownCode(code);
  }
  return parseInt((amount * UNITS[code][0]).toFixed());
};

/**
 * Returns the value represented in the specified unit
 *
 * @param {String|Number} code - The unit code or exchange rate
 * @returns {Number} The converted value
 */
Unit.prototype.to = function(code) {
  if (_.isNumber(code)) {
    if (code <= 0) {
      throw new errors.Unit.InvalidRate(code);
    }
    return parseFloat((this.EXCC * code).toFixed(2));
  }

  if (!UNITS[code]) {
    throw new errors.Unit.UnknownCode(code);
  }

  var value = this._value / UNITS[code][0];
  return parseFloat(value.toFixed(UNITS[code][1]));
};

/**
 * Returns the value represented in EXCC
 *
 * @returns {Number} The value converted to EXCC
 */
Unit.prototype.toEXCC = function() {
  return this.to(Unit.EXCC);
};

/**
 * Returns the value represented in mEXCC
 *
 * @returns {Number} The value converted to mEXCC
 */
Unit.prototype.toMillis = Unit.prototype.toMilis = function() {
  return this.to(Unit.mEXCC);
};

/**
 * Returns the value represented in dbits
 *
 * @returns {Number} The value converted to dbits
 */
Unit.prototype.toMicros = Unit.prototype.toDbits = function() {
  return this.to(Unit.dbits);
};

/**
 * Returns the value represented in exels
 *
 * @returns {Number} The value converted to exels
 */
Unit.prototype.toExels = function() {
  return this.to(Unit.exels);
};

/**
 * Returns the value represented in fiat
 *
 * @param {string} rate - The exchange rate between EXCC/currency
 * @returns {Number} The value converted to exels
 */
Unit.prototype.atRate = function(rate) {
  return this.to(rate);
};

/**
 * Returns a the string representation of the value in exels
 *
 * @returns {string} the value in exels
 */
Unit.prototype.toString = function() {
  return this.exels + ' exels';
};

/**
 * Returns a plain object representation of the Unit
 *
 * @returns {Object} An object with the keys: amount and code
 */
Unit.prototype.toObject = Unit.prototype.toJSON = function toObject() {
  return {
    amount: this.EXCC,
    code: Unit.EXCC
  };
};

/**
 * Returns a string formatted for the console
 *
 * @returns {string} the value in exels
 */
Unit.prototype.inspect = function() {
  return '<Unit: ' + this.toString() + '>';
};

module.exports = Unit;
