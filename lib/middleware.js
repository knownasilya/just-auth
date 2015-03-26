'use strict';

var authHeader = require('auth-header');
var tokenUtils = require('./token');

module.exports = function (options) {
  return function (req, res, next) {
    var authorization = req.get('authorization') || 'Bearer ' + req.query.token;

    req.challenge = authorization;

    var auth = authHeader.parse(authorization);

    if (auth && auth.values && auth.values.length) {
      auth = auth.values[0];

      if (auth.scheme !== 'Bearer') {
        return res.status(400).json('Invalid authorization scheme, expected \'Bearer\'');
      }

      tokenUtils.decode(auth.token, options, function (err, decoded) {
        if (err) {
          console.error(err);
          req.authenticated = false;
          req.authentication = err;
        }
        else {
          req.authenticated = true;
          req.authentication = decoded;
        }

        next();
      });
    }
    else {
      return res.status(400).json('Authorization token is missing');
    }
  };
};
