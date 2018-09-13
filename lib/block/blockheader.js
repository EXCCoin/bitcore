'use strict';

var _ = require('lodash');
var BN = require('../crypto/bn');
var BufferUtil = require('../util/buffer');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var Hash = require('../crypto/hash');
var JSUtil = require('../util/js');
var $ = require('../util/preconditions');

var GENESIS_BITS = 0x1d00ffff;

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
var BlockHeader = function BlockHeader(arg) {
  if (!(this instanceof BlockHeader)) {
    return new BlockHeader(arg);
  }
  var info = BlockHeader._from(arg);
  this.version = info.version;
  this.prevHash = info.prevHash;
  this.merkleRoot = info.merkleRoot;
  this.stakeRoot = info.stakeRoot;
  this.voteBits = info.voteBits;
  this.finalState = info.finalState;
  this.voters = info.voters;
  this.freshStake = info.freshStake;
  this.revocations = info.revocations;
  this.poolSize = info.poolSize;
  this.bits = info.bits;
  this.sbits = info.sbits;
  this.height = info.height;
  this.size = info.size;
  this.timestamp = info.timestamp;
  this.nonce = info.nonce;
  this.extraData = info.extraData;
  this.stakeVersion = info.stakeVersion;
  this.equihashSolution = info.equihashSolution;

  this.time = info.time;

  if (!this.timestamp) {
    this.timestamp = this.time;
  }

  if (info.hash) {
    $.checkState(
      this.hash === info.hash,
      'Argument object hash property does not match block hash.'
    );
  }

  return this;
};

/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block header data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
BlockHeader._from = function _from(arg) {
  var info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = BlockHeader._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = BlockHeader._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for BlockHeader');
  }
  return info;
};

/**
 * @param {Object} - A JSON string
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  var prevHash = data.prevHash;
  var merkleRoot = data.merkleRoot;
  var stakeRoot = data.stakeRoot;
  if (_.isString(data.prevHash)) {
    prevHash = BufferUtil.reverse(new Buffer(data.prevHash, 'hex'));
  }
  if (_.isString(data.merkleRoot)) {
    merkleRoot = BufferUtil.reverse(new Buffer(data.merkleRoot, 'hex'));
  }
  if (_.isString(data.stakeRoot)) {
    stakeRoot = BufferUtil.reverse(new Buffer(data.stakeRoot, 'hex'));
  }

  var info = {
    version: data.version,
    prevHash: prevHash,
    merkleRoot: merkleRoot,
    stakeRoot: stakeRoot,
    voteBits: data.voteBits,
    finalState: data.finalState,
    revocations: data.revocations,
    poolSize: data.poolSize,
    bits: data.bits,
    sbits: data.sbits,
    height: data.height,
    size: data.size,
    timestamp: data.timestamp,
    nonce: data.nonce,
    extraData: data.extraData,
    stakeVersion: data.stakeVersion,
    equihashSolution: data.equihashSolution,
    hash: data.hash,
    time: data.timestamp
  };

  if (!data.timestamp) {
    info.time = info.timestamp = data.time;
  }

  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromObject = function fromObject(obj) {
  var info = BlockHeader._fromObject(obj);
  return new BlockHeader(info);
};

/**
 * @param {Binary} - Raw block binary data or buffer
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromRawBlock = function fromRawBlock(data) {
  if (!BufferUtil.isBuffer(data)) {
    data = new Buffer(data, 'binary');
  }
  var br = BufferReader(data);
  br.pos = BlockHeader.Constants.START_OF_HEADER;
  var info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @param {Buffer} - A buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBuffer = function fromBuffer(buf) {
  var info = BlockHeader._fromBufferReader(BufferReader(buf));
  return new BlockHeader(info);
};

/**
 * @param {string} - A hex encoded buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromString = function fromString(str) {
  var buf = new Buffer(str, 'hex');
  return BlockHeader.fromBuffer(buf);
};

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromBufferReader = function _fromBufferReader(br) {
  var info = {};
  info.version = br.readInt32LE();
  info.prevHash = br.read(32);
  info.merkleRoot = br.read(32);
  info.stakeRoot = br.read(32);
  info.voteBits = br.readUInt16LE();
  info.freshStake = br.readUInt8();
  info.revocations = br.readUInt8();
  info.poolSize = br.readUInt32LE();
  info.bits = br.readUInt32LE();
  info.sbits = br.readInt64();
  info.height = br.readUInt32LE();
  info.size = br.readUInt32LE();
  info.timestamp = br.readUInt32LE();
  info.nonce = br.readUInt32LE();
  info.extraData = br.read(32);
  info.stakeVersion = br.readUInt32LE();
  info.equihashSolution = br.read(100);

  info.time = info.timestamp;
  return info;
};

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBufferReader = function fromBufferReader(br) {
  var info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @returns {Object} - A plain object of the BlockHeader
 */
BlockHeader.prototype.toObject = BlockHeader.prototype.toJSON = function toObject() {
  return {
    hash: this.hash,


    version: this.version,
    prevHash: BufferUtil.reverse(this.prevHash).toString('hex'),
    merkleRoot: BufferUtil.reverse(this.merkleRoot).toString('hex'),
    stakeRoot: BufferUtil.reverse(this.stakeRoot).toString('hex'),
    voteBits: this.voteBits,
    finalState: this.finalState,
    voters: this.voters,
    freshStake: this.freshStake,
    revocations: this.revocations,
    poolSize: this.poolSize,
    bits: this.bits,
    sbits: this.sbits,
    height: this.height,
    size: this.size,
    timestamp: this.timestamp,
    time: this.timestamp,
    nonce: this.nonce,
    extraData: this.extraData,
    stakeVersion: this.stakeVersion,
    equihashSolution: this.equihashSolution
  };
};

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
BlockHeader.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
 */
BlockHeader.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }
  bw.writeInt32LE(this.version);
  bw.write(this.prevHash);
  bw.write(this.merkleRoot);
  bw.write(this.stakeRoot);
  bw.writeUInt16LE(this.voteBits);
  bw.write(this.finalState);
  bw.writeInt16LE(this.voters);
  bw.writeUInt8(this.freshStake);
  bw.writeUInt8(this.revocations);
  bw.writeUInt32LE(this.poolSize);
  bw.writeUInt32LE(this.bits);
  bw.writeInt64(this.sbits);
  bw.writeUInt32LE(this.height);
  bw.writeUInt32LE(this.size);
  bw.writeUInt32LE(this.timestamp);
  bw.writeUInt32LE(this.nonce);
  bw.write(this.extraData);
  bw.writeUInt32LE(this.stakeVersion);
  bw.write(this.equihashSolution);
  return bw;
};

/**
 * Returns the target difficulty for this block
 * @param {Number} bits
 * @returns {BN} An instance of BN with the decoded difficulty bits
 */
BlockHeader.prototype.getTargetDifficulty = function getTargetDifficulty(bits) {
  bits = bits || this.bits;

  var target = new BN(bits & 0xffffff);
  var mov = 8 * ((bits >>> 24) - 3);
  while (mov-- > 0) {
    target = target.mul(new BN(2));
  }
  return target;
};

/**
 * @link https://en.bitcoin.it/wiki/Difficulty
 * @return {Number}
 */
BlockHeader.prototype.getDifficulty = function getDifficulty() {
  var difficulty1TargetBN = this.getTargetDifficulty(GENESIS_BITS).mul(new BN(Math.pow(10, 8)));
  var currentTargetBN = this.getTargetDifficulty();

  var difficultyString = difficulty1TargetBN.div(currentTargetBN).toString(10);
  var decimalPos = difficultyString.length - 8;
  difficultyString = difficultyString.slice(0, decimalPos) + '.' + difficultyString.slice(decimalPos);

  return parseFloat(difficultyString);
};

/**
 * @returns {Buffer} - The little endian hash buffer of the header
 */
BlockHeader.prototype._getHash = function hash() {
  var buf = this.toBuffer();
  return Hash.sha256(buf);
};

var idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get: function() {
    if (!this._id) {
      this._id = BufferReader(this._getHash()).readReverse().toString('hex');
    }
    return this._id;
  },
  set: _.noop
};
Object.defineProperty(BlockHeader.prototype, 'id', idProperty);
Object.defineProperty(BlockHeader.prototype, 'hash', idProperty);

/**
 * @returns {Boolean} - If timestamp is not too far in the future
 */
BlockHeader.prototype.validTimestamp = function validTimestamp() {
  var currentTime = Math.round(new Date().getTime() / 1000);
  if (this.time > currentTime + BlockHeader.Constants.MAX_TIME_OFFSET) {
    return false;
  }
  return true;
};

/**
 * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
 */
BlockHeader.prototype.validProofOfWork = function validProofOfWork() {
  var pow = new BN(this.id, 'hex');
  var target = this.getTargetDifficulty();

  if (pow.cmp(target) > 0) {
    return false;
  }
  return true;
};

/**
 * @returns {string} - A string formatted for the console
 */
BlockHeader.prototype.inspect = function inspect() {
  return '<BlockHeader ' + this.id + '>';
};

BlockHeader.Constants = {
  START_OF_HEADER: 8, // Start buffer position in raw block data
  MAX_TIME_OFFSET: 2 * 60 * 60, // The max a timestamp can be in the future
  LARGEST_HASH: new BN('10000000000000000000000000000000000000000000000000000000000000000', 'hex')
};

module.exports = BlockHeader;
