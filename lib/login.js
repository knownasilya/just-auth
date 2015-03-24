'use strict';

var bcrypt = require('bcrypt');
var createToken = require('./token');

module.exports = function (options) {
  var getUser = options.getUser
  var configureToken = options.configureToken;
  var validatePassword = options.validatePassword || bcrypt.compareSync;

  return function (req, res) {
    var body = req.body;
    var idField = options.idField;
    var passwordField = options.passwordField;
    var id = body[idField];
    var password = body[passwordField];

    if (id && password) {
      getUser(id, function (err, user) {
        if (err) {
          return res.status(500).json(err);
        }

        var hash;

        if (!user || user[options.passwordHashField]) {
          hash = user[options.passwordHashField];

          if (validatePassword(password, hash)) {
            delete user[options.passwordHashField];


            if (configureToken) {
              configureToken(user, function (tokenData) {
                var token = createToken(tokenData, options.secret);
                res.json({ token: token });
              });
            }
            else {
              var token = createToken(user[idField], options.secret);
              res.json({ token: token });
            }
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
