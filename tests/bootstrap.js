'use strict';

const express = require('express');
const morgan = require('morgan');
const lib = require('../');

module.exports = function (options) {
  const app = express();
  const instance = lib(options);

  app.use(morgan('dev'));
  app.use('/auth', instance.router);

  app.get('/admin', instance.middleware.required(), function (req, res) {
    res.json('ok');
  });

  app.use(function (err, req, res, next) {
    res.status(err.status || 500).json(err || req.authentication);
  });

  return app;
};
