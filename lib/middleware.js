'use strict';

var authHeader = require('auth-header');
var tokenUtils = require('./token');

module.exports = function (options) {
  return function (req, res, next) {
    var auth = authHeader.parse(req.get('authorization'));

    if (auth && auth.values && auth.values.length) {
      auth = auth.values[0];

      if (auth.scheme !== 'Bearer') {
        return res.status(400).json('Invalid authorization scheme, expected \'Bearer\'');
      }

      tokenUtils.decode(auth.token, options, function (err, decoded) {
        if (err) {
          console.error(err);
          req.authenticated = false;
        }

        req.authenticated = true;
        next();
      });
    }
    else {
      return res.status(400).json('Authorization token is missing');
    }
  };
};
