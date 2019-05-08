const Mocha = require('mocha');
const expect = require('chai').expect;
const mocha = new Mocha();

const { getTimezoneOffset } = require('./time');

describe('getTimezoneOffset', () => {
  it(`UTC | offset = 0`, () => {
    expect(getTimezoneOffset(0)).to.equal('-00:00');
  });

  it(`null | offset = null`, () => {
    expect(getTimezoneOffset(null)).to.equal('-00:00');
  });

  it(`Australia | offset = 570`, () => {
    expect(getTimezoneOffset(570)).to.equal('+09:30');
  });

  it(`Burma | offset = 390`, () => {
    expect(getTimezoneOffset(390)).to.equal('+06:30');
  });

  it(`Canada, Newfoundland | offset = -210`, () => {
    expect(getTimezoneOffset(-210)).to.equal('-03:30');
  });

  it(`Fiji | offset = '720`, () => {
    expect(getTimezoneOffset(720)).to.equal('+12:00');
  });

  it(`Nepal | offset = 345`, () => {
    expect(getTimezoneOffset(345)).to.equal('+05:45');
  });

  it(`New Zealand, Chantham Island | offset = 765`, () => {
    expect(getTimezoneOffset(765)).to.equal('+12:45');
  });
});
