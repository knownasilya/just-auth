'use strict';

var deleteKey = require('key-del');
var get = require('lodash.get');
var tokenUtils = require('./token');

module.exports = function (options) {
  return function (req, res) {
    var getUser = options.getUser;
    var configureToken = options.configureToken || require('./configure-token');
    var validatePassword = options.validatePassword || require('./password').validate;
    var body = req.body;
    var idField = options.idField;
    var passwordField = options.passwordField;
    var passwordHashField = options.passwordHashField;
    var rememberMeField = options.rememberMeField;
    var rememberMeAdditionalMinutes = options.rememberMeAdditionalMinutes;
    var id = get(body, idField);
    var password = get(body, passwordField);
    var rememberMe = get(body, rememberMeField);

    if (id && password) {
      debugger;
      if (rememberMe) {
        if (options.tokenOptions.expiresInSeconds) {
          options.tokenOptions.expiresInSeconds += rememberMeAdditionalMinutes * 60;
        } else {
          options.tokenOptions.expiresInMinutes += rememberMeAdditionalMinutes;
        }
      }

      getUser.call({ req: req }, id, function (err, user) {
        if (err) {
          return res.status(401).json(err);
        }

        var hash;

        if (user && get(user, passwordHashField)) {
          hash = get(user, passwordHashField);

          validatePassword(password, hash).then(function (valid) {
            var tokenData, token;

            if (valid) {
              deleteKey(user, passwordHashField, { copy: false });
              tokenData = configureToken(user) || get(user, idField);
              token = tokenUtils.create(tokenData, options);

              res.json({ token: token });
            } else {
              res.status(401).json('Unauthorized');
            }
          })
          .catch(function (error) {
            res.status(400).json(error);
          });
        } else {
          res.status(400).json('Invalid user data.');
        }
      });
    } else {
      res.status(400).json('Invalid arguments, expected `' + idField + '` and `' + passwordField + '` to be present.');
    }
  };
};
