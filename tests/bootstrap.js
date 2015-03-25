'use strict';

var express = require('express');
var morgan = require('morgan');
var lib = require('../');


module.exports = function (options) {
  var app = express();
  var instance = lib(options);

  app.use(morgan('dev'));
  app.use('/auth', instance.router);

  app.get('/admin', instance.middleware.required(), function (req, res) {
    res.json('ok');
  });

  return app;
};
