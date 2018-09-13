var Put = require('bufferput');
var buffertools = require('buffertools');
var hex = function(hex) {
  return new Buffer(hex, 'hex');
};

exports.livenet = {
  name: 'livenet',
  magic: hex('f9beb4d9'),
  addressVersion: 0x00,
  privKeyVersion: 128,
  P2SHVersion: 5,
  hkeyPublicVersion: 0x0488b21e,
  hkeyPrivateVersion: 0x0488ade4,
  genesisBlock: {
    hash: hex('6FE28C0AB6F1B372C1A6A246AE63F74F931E8365E15A089C68D6190000000000'),
    merkle_root: hex('3BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A'),
    height: 0,
    nonce: 2083236893,
    version: 1,
    prev_hash: buffertools.fill(new Buffer(32), 0),
    timestamp: 1231006505,
    bits: 486604799,
  },
  dnsSeeds: [
    'seed.bitcoin.sipa.be',
    'dnsseed.bluematt.me',
    'dnsseed.bitcoin.dashjr.org',
    'seed.bitcoinstats.com',
    'seed.bitnodes.io',
    'bitseed.xf2.org'
  ],
  defaultClientPort: 8333
};

exports.mainnet = exports.livenet;

exports.testnet = {
  name: 'testnet',
  magic: hex('0b110907'),
  addressVersion: 0x6f,
  privKeyVersion: 239,
  P2SHVersion: 196,
  hkeyPublicVersion: 0x043587cf,
  hkeyPrivateVersion: 0x04358394,
  genesisBlock: {
    hash: hex('43497FD7F826957108F4A30FD9CEC3AEBA79972084E90EAD01EA330900000000'),
    merkle_root: hex('3BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A'),
    height: 0,
    nonce: 414098458,
    version: 1,
    prev_hash: buffertools.fill(new Buffer(32), 0),
    timestamp: 1296688602,
    bits: 486604799,
  },
  dnsSeeds: [
    'testnet-seed.bitcoin.petertodd.org',
    'testnet-seed.bluematt.me'
  ],
  defaultClientPort: 18333
};

exports.exccdlivenet = {
  name: 'exccdlivenet',
  magic: hex('e1d71799'),
  addressVersion: 0x21b9,
  privKeyVersion: 0x80,
  P2SHVersion: 0x34af,
  hkeyPublicVersion: 0x0488b2e1,
  hkeyPrivateVersion: 0x0488ade4,
  genesisBlock: {
    hash: hex('7894a6641a12f4f55e5faa1691c5a1f1ddb0d05d03817b834bfc9f5efadd915f'), //
    merkle_root: hex('8a2c43aa5acaba5bdb5dc2191201ca9ae0f56f0e149bb58ddb4dccc5c844d7e0'),
    height: 0,
    nonce: 0,
    version: 1,
    prev_hash: buffertools.fill(new Buffer(32), 0),
    timestamp: 1531731600,
    bits: "2000a3d7",
  },
  dnsSeeds: [
    "seed.excc.co",
    "seed.xchange.me",
    "excc-seed.pragmaticcoders.com",
    "seed.exccited.com"
  ],
  defaultClientPort: 9108
};

exports.exccdtestnet = {
  name: 'exccdtestnet',
  magic: hex('2a75a45a'),
  addressVersion: 0x0f21,
  privKeyVersion: 0xef,
  P2SHVersion: 0x0efc,
  hkeyPublicVersion: 0x043587d1,
  hkeyPrivateVersion: 0x04358397,
  genesisBlock: {
    hash: hex('c049c55f8af52b8423d090758f003c515441209ab880a782a6d5594a51abf338'),
    merkle_root: hex('e736813725d3c63f4f50816b627c1394d268fab23ef9bd5e81ea633b48042953'),
    height: 0,
    nonce: 414098458,
    version: 4,
    prev_hash: buffertools.fill(new Buffer(32), 0),
    timestamp: 1532420489,
    bits: "20066666",
  },
  dnsSeeds: [
    "testnet-seed.excc.co"
  ],
  defaultClientPort: 19108
};
