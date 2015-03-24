'use strict';

var pbkdf2 = require('pbkdf2-utils');
var createToken = require('./token');

module.exports = function (options) {
  return function (req, res) {
    var getUser = options.getUser
    var configureToken = options.configureToken;
    var validatePassword = options.validatePassword || pbkdf2.verify;
    var body = req.body;
    var idField = options.idField;
    var passwordField = options.passwordField;
    var id = body[idField];
    var password = body[passwordField];

    if (id && password) {
      getUser.call({ req: req }, id, function (err, user) {
        if (err) {
          return res.status(500).json(err);
        }

        var hash;

        if (user && user[options.passwordHashField]) {
          hash = user[options.passwordHashField];

          if (validatePassword(password, hash)) {
            delete user[options.passwordHashField];

            if (configureToken) {
              var tokenData = configureToken(user);
            }

            tokenData = tokenData || user[idField];

            var token = createToken(tokenData, options);

            res.json({ token: token });
          }
          else {
            res.status(401).json('Unauthorized');
          }
        }
        else {
          res.status(400).json('Invalid user data.');
        }
      });
    }
    else {
      res.status(400).json('Invalid arguments, expected `' + idField + '` and `' + passwordField + '` to be present.');
    }
  };
};
