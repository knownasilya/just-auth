'use strict';

const extend = require('extend');
const express = require('express');
const authentication = require('express-authentication')();
const bodyParser = require('body-parser');

let defaults = {
  loginEndpoint: '/login',
  idField: 'email',
  passwordField: 'password',
  passwordHashField: 'passwordHash',
  rememberMeField: 'rememberMe',
  // 13 days, totaling 2 weeks
  rememberMeAdditionalMinutes: 60 * 24 * 13,
  tokenOptions: {
    // A full day
    expiresIn: 60 * 60 * 24,
  },
};

module.exports = function (options) {
  const router = new express.Router();
  const loginHandler = require('./lib/login');
  const middleware = require('./lib/middleware');

  options = options || {};
  options = extend(true, {}, defaults, options);

  if (!options.secret) {
    throw new Error('just-auth requires a `secret` to be set in the options.');
  }

  if (!options.getUser || typeof options.getUser !== 'function') {
    throw new Error(
      'just-auth requires a `getUser(id, callback)` function to be defined. ' +
        'See https://github.com/knownasilya/just-auth#getuser for details.'
    );
  }

  // Setup router specific middleware
  router.use(bodyParser.json());
  router.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );

  // Login endpoints
  router.route(options.loginEndpoint).post(loginHandler(options));

  const authMiddleware = authentication
    .for('just-auth')
    .use(middleware(options));

  return {
    router: router,
    middleware: authMiddleware,
    createToken: function createTokenExternal(data, remember) {
      const createToken = require('./lib/create-token');
      return createToken(data, remember, options);
    },
  };
};
