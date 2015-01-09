'use strict';

var extend = require('extend');
var express = require('express');
var bodyParser = require('body-parser');

var loginHandler = require('./lib/login');
var logoutHandler = require('./lib/logout');

var router = express.Router();
var defaults = {
  loginEndpoint: '/login',
  logoutEndpoint: '/logout',
  idField: 'email',
  passwordField: 'password',
  passwordHashField: 'passwordHash',
  tokenField: 'token'
};

module.exports = function (options) {
  options = options || {};
  options = extend({}, defaults, options);

  if (!options.getUser || typeof options.getUser !== 'function') {
    throw new Error('just-auth requires a `getUser(id, callback)` function to be defined. ' +
      'See https://github.com/knownasilya/just-auth#getuser for details.');
  }

  if (!options.invalidateUser || typeof options.invalidateUser !== 'function') {
    throw new Error('just-auth requires a `invalidateUser(token, callback)` function to be defined. ' +
      'See https://github.com/knownasilya/just-auth#invalidateuser for details.');
  }

  // Setup router specific middleware
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: false
  }));

  // Login endpoints
  router.route(options.loginEndpoint)
    .post(loginHandler(options));

  // Logout endpoints
  router.route(options.logoutEndpoint)
    .post(logoutHandler(options));

  return router;
};
