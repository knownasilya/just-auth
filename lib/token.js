'use strict';

var jwt = require('jsonwebtoken');

function createToken(data, options) {
  return jwt.sign(data, options.secret, options.tokenOptions);
}

module.exports = createToken;
