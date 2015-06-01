'use strict';

var extend = require('extend');
var express = require('express');
var authentication = require('express-authentication')();
var bodyParser = require('body-parser');

var defaults = {
  loginEndpoint: '/login',
  idField: 'email',
  passwordField: 'password',
  passwordHashField: 'passwordHash',
  tokenOptions: {
    // A full day
    expiresInMinutes: 60 * 24
  }
};

module.exports = function (options) {
  var router = express.Router();
  var loginHandler = require('./lib/login');
  var middleware = require('./lib/middleware');

  options = options || {};
  options = extend(true, {}, defaults, options);

  if (options.tokenOptions.expiresInSeconds) {
    delete options.tokenOptions.expiresInMinutes;
  }

  if (!options.secret) {
    throw new Error('just-auth requires a `secret` to be set in the options.');
  }

  if (!options.getUser || typeof options.getUser !== 'function') {
    throw new Error('just-auth requires a `getUser(id, callback)` function to be defined. ' +
      'See https://github.com/knownasilya/just-auth#getuser for details.');
  }

  // Setup router specific middleware
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({
    extended: false
  }));

  // Login endpoints
  router.route(options.loginEndpoint)
    .post(loginHandler(options));

  var authMiddleware = authentication.for(middleware(options));

  return {
    router: router,
    middleware: authMiddleware
  };
};
