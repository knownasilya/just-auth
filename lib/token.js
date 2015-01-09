'use strict';

var crypto = require('crypto');
var TOKEN_LENGTH = 32;

function getToken(callback) {
  crypto.randomBytes(TOKEN_LENGTH, function(err, token) {
    if (err) {
      return callback(err);
    }

    if (token) {
      callback(null, token.toString('hex'));
    }
    else {
      callback(new Error('Problem when generating token'));
    }
  });
}

module.exports = getToken;
