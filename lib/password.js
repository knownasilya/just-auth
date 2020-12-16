'use strict';

const pbkdf2 = require('pbkdf2-utils');

exports.validate = function (password, hash) {
  return pbkdf2.verify(password, Buffer.from(hash, 'base64'));
};

exports.hash = function (password, cb) {
  pbkdf2.hash(password, 2000, function (err, buf) {
    cb(err, buf.toString('base64'));
  });
};
