'use strict';

var express = require('express');
var lib = require('../');

var app = express();

module.exports = function (options) {
  app.use('/auth', lib(options));

  return app;
};
