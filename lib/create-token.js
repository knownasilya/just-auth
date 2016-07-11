'use strict';

var get = require('lodash.get');
var tokenUtils = require('./token');

module.exports = function createToken(user, rememberMe, options) {
  var configureToken = options.configureToken || require('./configure-token');
  var rememberMeAdditionalMinutes = options.rememberMeAdditionalMinutes;

  if (rememberMe) {
    if (options.tokenOptions.expiresInSeconds) {
      options.tokenOptions.expiresInSeconds += rememberMeAdditionalMinutes * 60;
    } else {
      options.tokenOptions.expiresInMinutes += rememberMeAdditionalMinutes;
    }
  }

  var tokenData = configureToken(user) || get(user, options.idField);
  var token = tokenUtils.create(tokenData, options);

  return token;
};
