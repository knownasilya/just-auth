'use strict';

var tokenUtils = require('./token');

module.exports = function (options) {
  return function (req, res) {
    var getUser = options.getUser
    var configureToken = options.configureToken || require('./configure-token');
    var validatePassword = options.validatePassword || require('./password').validate;
    var body = req.body;
    var idField = options.idField;
    var passwordField = options.passwordField;
    var passwordHashField = options.passwordHashField;
    var id = body[idField];
    var password = body[passwordField];

    if (id && password) {
      getUser.call({ req: req }, id, function (err, user) {
        if (err) {
          return res.status(401).json(err);
        }

        var hash;

        if (user && user[passwordHashField]) {
          hash = user[passwordHashField];

          validatePassword(password, hash).then(function (valid) {
            var tokenData, token;

            if (valid) {
              delete user[passwordHashField];
              tokenData = configureToken(user) || user[idField];
              token = tokenUtils.create(tokenData, options);

              res.json({ token: token });
            }
            else {
              res.status(401).json('Unauthorized');
            }
          })
          .catch(function (error) {
            res.status(400).json(error);
          });
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
