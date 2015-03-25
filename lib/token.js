'use strict';

var jwt = require('jsonwebtoken');

exports.create = function createToken(data, options) {
  return jwt.sign(data, options.secret, options.tokenOptions);
};

exports.decode = function decodeToken(token, options, callback) {
  jwt.verify(token, options.secret, function (err, decoded) {
    debugger;
    callback(err, decoded);
  });
};
