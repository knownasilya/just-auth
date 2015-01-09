'use strict';

var authHeader = require('auth-header')

module.exports = function (options) {
  var invalidateUser = options.invalidateUser;

  return function (req, res) {
    var auth = authHeader.parse(req.get('authorization'));

    if (auth.scheme !== 'Bearer') {
      return res.status(400).json('Invalid authorization scheme, expected \'Bearer\'');
    }

    invalidateUser(auth.token, function (err) {
      if (err) {
        return res.status(400).json('Invalidating user failed');
      }

      res.json({});
    });
  };
};
