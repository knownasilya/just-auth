'use strict';

var pbkdf2 = require('pbkdf2-utils');

exports.validate = function (password, hash) {
  return pbkdf2.verify(password, new Buffer(hash, 'base64'));
};

exports.hash = function (password, cb) {
  pbkdf2.hash(password, 2000, function (err, buf) {
    cb(err, buff.toString('base64'));
  });
};
