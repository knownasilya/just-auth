'use strict';

const jwt = require('jsonwebtoken');

/**
 * Create a token based on some data.
 *
 * @param {Object} data Data to add to the token.
 * @param {Object} options options include `secret` and `tokenOptions`.
 * @returns {Promise} returns a promise with the token
 */
exports.create = function createToken(data, options) {
  return jwt.sign(data, options.secret, options.tokenOptions);
};

exports.decode = function decodeToken(token, options, callback) {
  jwt.verify(token, options.secret, function (err, decoded) {
    callback(err, decoded);
  });
};
