'use strict';

var express = require('express');
var lib = require('../');

var app = express();

app.use('/auth', lib());

module.exports = app;
