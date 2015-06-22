'use strict';

var tokenUtils = require('./token');

module.exports = function (options) {
  return function (req, res) {
    var getUser = options.getUser
    var configureToken = options.configureToken;
    var validatePassword = options.validatePassword || require('./password').validate;
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

          validatePassword(password, hash).then(function (valid) {
            if (valid) {
              delete user[options.passwordHashField];

              if (configureToken) {
                var tokenData = configureToken(user);
              }

              tokenData = tokenData || user[idField];

              var token = tokenUtils.create(tokenData, options);

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
