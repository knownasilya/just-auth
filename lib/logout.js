'use strict';

var authHeader = require('auth-header')

module.exports = function (options) {
  return function (req, res) {
    var auth = authHeader.parse(req.get('authorization'));

    if (auth && auth.values && auth.values.length) {
      auth = auth.values[0];
    }
    else {
      return res.status(400).json('Authorization token is missing');
    }

    if (auth.scheme !== 'Bearer') {
      return res.status(400).json('Invalid authorization scheme, expected \'Bearer\'');
    }

    res.json({});
  };
};
