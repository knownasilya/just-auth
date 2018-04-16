'use strict';

var authHeader = require('auth-header');
var tokenUtils = require('./token');

module.exports = function (options) {
  return function (req, res, next) {
    var authorization = req.query.token ? 'Bearer ' + req.query.token : req.get('authorization');
    var auth;

    req.challenge = authorization;

    try {
      auth = authHeader.parse(authorization);
    } catch (error) {
      return res.status(400).json('Invalid authorization supplied');
    }

    if (auth && auth.scheme && auth.token) {
      if (auth.scheme !== 'Bearer') {
        return res.status(400).json('Invalid authorization scheme, expected \'Bearer\'');
      }

      tokenUtils.decode(auth.token, options, function (err, decoded) {
        if (err) {
          console.error(err);
          req.authenticated = false;
          req.authentication = err;
        } else {
          req.authenticated = true;
          req.authentication = decoded;
        }

        next();
      });
    } else {
      req.authenticated = false;
      req.authentication = 'Authorization token is missing';
      next();
    }
  };
};
