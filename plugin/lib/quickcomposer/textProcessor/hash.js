const NodeForge = require("node-forge");
const sm3 = require("sm-crypto").sm3;

const hash = {
  // MD5 哈希
  md5Hash: function (text) {
    return NodeForge.md.md5.create().update(text).digest().toHex();
  },
  // SHA1 哈希
  sha1Hash: function (text) {
    return NodeForge.md.sha1.create().update(text).digest().toHex();
  },
  // SHA256 哈希
  sha256Hash: function (text) {
    return NodeForge.md.sha256.create().update(text).digest().toHex();
  },
  // SHA512 哈希
  sha512Hash: function (text) {
    return NodeForge.md.sha512.create().update(text).digest().toHex();
  },
  // SM3 哈希
  sm3Hash: function (text) {
    return sm3(text);
  },
};

module.exports = hash;
