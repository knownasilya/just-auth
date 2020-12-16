'use strict';

const get = require('lodash.get');
const tokenUtils = require('./token');

module.exports = function createToken(user, rememberMe, options) {
  let configureToken = options.configureToken || require('./configure-token');
  let rememberMeAdditionalMinutes = options.rememberMeAdditionalMinutes;

  if (rememberMe) {
    options.tokenOptions.expiresIn += rememberMeAdditionalMinutes * 60;
  }

  let tokenData = configureToken(user) || get(user, options.idField);
  let token = tokenUtils.create(tokenData, options);

  return token;
};
