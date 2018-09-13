'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var bitcore = require('..');
var errors = bitcore.errors;
var Unit = bitcore.Unit;

describe('Unit', function() {

  it('can be created from a number and unit', function() {
    expect(function() {
      return new Unit(1.2, 'EXCC');
    }).to.not.throw();
  });

  it('can be created from a number and exchange rate', function() {
    expect(function() {
      return new Unit(1.2, 350);
    }).to.not.throw();
  });

  it('no "new" is required for creating an instance', function() {
    expect(function() {
      return Unit(1.2, 'EXCC');
    }).to.not.throw();

    expect(function() {
      return Unit(1.2, 350);
    }).to.not.throw();
  });

  it('has property accesors "EXCC", "mEXCC", "uEXCC", "dbits", and "exels"', function() {
    var unit = new Unit(1.2, 'EXCC');
    unit.EXCC.should.equal(1.2);
    unit.mEXCC.should.equal(1200);
    unit.uEXCC.should.equal(1200000);
    unit.dbits.should.equal(1200000);
    unit.exels.should.equal(120000000);
  });

  it('a string amount is allowed', function() {
    var unit;

    unit = Unit.fromEXCC('1.00001');
    unit.EXCC.should.equal(1.00001);

    unit = Unit.fromMillis('1.00001');
    unit.mEXCC.should.equal(1.00001);

    unit = Unit.fromDbits('100');
    unit.dbits.should.equal(100);

    unit = Unit.fromExels('8999');
    unit.exels.should.equal(8999);

    unit = Unit.fromFiat('43', 350);
    unit.EXCC.should.equal(0.12285714);
  });

  it('should have constructor helpers', function() {
    var unit;

    unit = Unit.fromEXCC(1.00001);
    unit.EXCC.should.equal(1.00001);

    unit = Unit.fromMilis(1.00001);
    unit.mEXCC.should.equal(1.00001);

    unit = Unit.fromDbits(100);
    unit.dbits.should.equal(100);

    unit = Unit.fromExels(8999);
    unit.exels.should.equal(8999);

    unit = Unit.fromFiat(43, 350);
    unit.EXCC.should.equal(0.12285714);
  });

  it('converts to exels correctly', function() {
    /* jshint maxstatements: 25 */
    var unit;

    unit = Unit.fromEXCC(1.3);
    unit.mEXCC.should.equal(1300);
    unit.dbits.should.equal(1300000);
    unit.exels.should.equal(130000000);

    unit = Unit.fromMilis(1.3);
    unit.EXCC.should.equal(0.0013);
    unit.dbits.should.equal(1300);
    unit.exels.should.equal(130000);

    unit = Unit.fromDbits(1.3);
    unit.EXCC.should.equal(0.0000013);
    unit.mEXCC.should.equal(0.0013);
    unit.exels.should.equal(130);

    unit = Unit.fromExels(3);
    unit.EXCC.should.equal(0.00000003);
    unit.mEXCC.should.equal(0.00003);
    unit.dbits.should.equal(0.03);
  });

  it('takes into account floating point problems', function() {
    var unit = Unit.fromEXCC(0.00000003);
    unit.mEXCC.should.equal(0.00003);
    unit.dbits.should.equal(0.03);
    unit.exels.should.equal(3);
  });

  it('exposes unit codes', function() {
    should.exist(Unit.EXCC);
    Unit.EXCC.should.equal('EXCC');

    should.exist(Unit.mEXCC);
    Unit.mEXCC.should.equal('mEXCC');

    should.exist(Unit.dbits);
    Unit.dbits.should.equal('dbits');

    should.exist(Unit.exels);
    Unit.exels.should.equal('exels');
  });

  it('exposes a method that converts to different units', function() {
    var unit = new Unit(1.3, 'EXCC');
    unit.to(Unit.EXCC).should.equal(unit.EXCC);
    unit.to(Unit.mEXCC).should.equal(unit.mEXCC);
    unit.to(Unit.dbits).should.equal(unit.dbits);
    unit.to(Unit.exels).should.equal(unit.exels);
  });

  it('exposes shorthand conversion methods', function() {
    var unit = new Unit(1.3, 'EXCC');
    unit.toEXCC().should.equal(unit.EXCC);
    unit.toMilis().should.equal(unit.mEXCC);
    unit.toMillis().should.equal(unit.mEXCC);
    unit.toDbits().should.equal(unit.dbits);
    unit.toExels().should.equal(unit.exels);
  });

  it('can convert to fiat', function() {
    var unit = new Unit(1.3, 350);
    unit.atRate(350).should.equal(1.3);
    unit.to(350).should.equal(1.3);

    unit = Unit.fromEXCC(0.0123);
    unit.atRate(10).should.equal(0.12);
  });

  it('toString works as expected', function() {
    var unit = new Unit(1.3, 'EXCC');
    should.exist(unit.toString);
    unit.toString().should.be.a('string');
  });

  it('can be imported and exported from/to JSON', function() {
    var json = JSON.stringify({amount:1.3, code:'EXCC'});
    var unit = Unit.fromObject(JSON.parse(json));
    JSON.stringify(unit).should.deep.equal(json);
  });

  it('importing from invalid JSON fails quickly', function() {
    expect(function() {
      return Unit.fromJSON('¹');
    }).to.throw();
  });

  it('inspect method displays nicely', function() {
    var unit = new Unit(1.3, 'EXCC');
    unit.inspect().should.equal('<Unit: 130000000 exels>');
  });

  it('fails when the unit is not recognized', function() {
    expect(function() {
      return new Unit(100, 'USD');
    }).to.throw(errors.Unit.UnknownCode);
    expect(function() {
      return new Unit(100, 'EXCC').to('USD');
    }).to.throw(errors.Unit.UnknownCode);
  });

  it('fails when the exchange rate is invalid', function() {
    expect(function() {
      return new Unit(100, -123);
    }).to.throw(errors.Unit.InvalidRate);
    expect(function() {
      return new Unit(100, 'EXCC').atRate(-123);
    }).to.throw(errors.Unit.InvalidRate);
  });

});
