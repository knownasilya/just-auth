'use strict';

var jwt = require('jsonwebtoken');

function createToken(data, secret) {
  return jwt.sign(data, secret);
}

module.exports = createToken;
