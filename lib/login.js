'use strict';

var deleteKey = require('key-del');
var get = require('lodash.get');
var createToken = require('./create-token');

module.exports = function (options) {
  return function (req, res) {
    var getUser = options.getUser;
    var validatePassword = options.validatePassword || require('./password').validate;
    var body = req.body;
    var idField = options.idField;
    var passwordField = options.passwordField;
    var passwordHashField = options.passwordHashField;
    var rememberMeField = options.rememberMeField;
    var rememberMe = get(body, rememberMeField);
    var id = get(body, idField);
    var password = get(body, passwordField);

    if (id && password) {
      getUser.call({ req: req }, id, function (err, user) {
        if (err) {
          return res.status(401).json(err);
        }

        var hash;

        if (user && get(user, passwordHashField)) {
          hash = get(user, passwordHashField);

          validatePassword(password, hash).then(function (valid) {
            var token;

            if (valid) {
              deleteKey(user, passwordHashField, { copy: false });
              token = createToken(user, rememberMe, options);

              res.json({ token: token });
            } else {
              res.status(401).json('Unauthorized');
            }
          })
          .catch(function (error) {
            res.status(400).json(error.message);
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
