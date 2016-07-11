'use strict';

var get = require('lodash.get');
var tokenUtils = require('./token');

module.exports = function createToken(user, rememberMe, options) {
  var configureToken = options.configureToken || require('./configure-token');
  var rememberMeAdditionalMinutes = options.rememberMeAdditionalMinutes;

  if (rememberMe) {
    options.tokenOptions.expiresIn += rememberMeAdditionalMinutes * 60;
  }

  var tokenData = configureToken(user) || get(user, options.idField);
  var token = tokenUtils.create(tokenData, options);

  return token;
};
