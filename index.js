'use strict';

var extend = require('extend');
var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();
var defaults = {
  loginEndpoint: '/login',
  logoutEndpoint: '/logout',
  idField: 'email',
  passwordField: 'password'
};

module.exports = function (options) {
  options = options || {};
  options = extend({}, defaults, options);

  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: false
  }));

  router.post(options.loginEndpoint, function (req, res) {
    var body = req.body;
    var idField = options.idField;
    var passwordField = options.passwordField;

    if (body[idField] && body[passwordField]) {
      res.json('ok');
    }
    else {
      res.status(400).json('Invalid arguments, expected `' + idField + '` and `' + passwordField + '` to be present.');
    }
  });

  router.post(options.logoutEndpoint, function (req, res) {

  });

  return router;
};
