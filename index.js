'use strict';

var extend = require('extend');
var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

var router = express.Router();
var defaults = {
  loginEndpoint: '/login',
  logoutEndpoint: '/logout',
  idField: 'email',
  passwordField: 'password',
  passwordHashField: 'password_hash'
};

module.exports = function (options) {
  options = options || {};
  options = extend({}, defaults, options);

  if (!options.getUser || typeof options.getUser !== 'function') {
    throw new Error('just-auth requires a `getUser(id, callback)` function to be defined. See https://github.com/knownasilya/just-auth#getuser for details.');
  }

  var getUser = options.getUser
  var validatePassword = options.validatePassword || bcrypt.compareSync;

  // Setup router specific middleware
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: false
  }));

  // Login endpoints
  router.post(options.loginEndpoint, function (req, res) {
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

            res.json({ user: user });
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
  });

  router.post(options.logoutEndpoint, function (req, res) {

  });

  return router;
};
