'use strict';

var request = require('supertest');
var express = require('express');
var test = require('tape');
var boot = require('./bootstrap');
var helpers = require('./helpers');
var lib = require('../');
var hash = 'IAQAAAfQKUkNkhzJPUtnQ0ZutmxXAdmsoDGGFU1xb4DZELh1Qo0PpHfiddHMOPGvceLuaKuH';
var hashBuffer = new Buffer(hash, 'base64');

test('secret not set', function (t) {
  t.throws(function () {
    boot({})
  }, /just-auth requires a `secret`/, 'Missing secret throws error');
  t.end();
});

test('invalid #getUser', function (t) {
  t.throws(function () {
    boot({
      secret: 'test'
    })
  }, /getUser\(id, callback\)` function to be defined/, 'Missing function throws descriptive error');
  t.end();
});

test('exports correct object on init', function (t) {
  var instance = lib({
    secret: 'blah',
    getUser: function (cb) {
      cb();
    }
  });

  t.ok(instance.router && instance.router.length === 3, 'has express router');
  t.ok(instance.middleware && instance.middleware.required, 'has express-authentication middleware object');

  t.end();
});

test('login works', function (t) {
  var jwt = require('jsonwebtoken');
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hashBuffer
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.ok(res.body.token, 'Has token');
      t.equal(jwt.verify(res.body.token, options.secret), 'blah@blah', 'Token valid');

      t.end();
    });
});

test('login getUser error passed on', function (t) {
  var options = helpers.validBlankOptions({
    email: false,
    passwordHash: '$2a$08$3hwGAN.NKAP/6VX3NdJ3zuDmEv0qfzXnOexwEzq2gT.rUk3ohx37y'
  });
  var instance = lib(options);
  var app = express();
  app.use('/auth', instance.router);

  request(app)
    .post('/auth/login')
    .send({ email: 'user', password: 'blah' })
    .expect('Content-Type', /json/)
    .expect(500)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.same(res.body, { err: 'fail' }, 'Response passed on');
      t.end();
    });
});

test('invalid login body data', function (t) {
  request(boot(helpers.validBlankOptions()))
    .post('/auth/login')
    .send({ id: 'user', pass: 'blah' })
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Invalid arguments, expected `email` and `password` to be present.', 'Responds with required arguments');
      t.end();
    });
});

test('logout responds to Bearer token', function (t) {
  request(boot(helpers.validBlankOptions()))
    .post('/auth/logout')
    .set('Authorization', 'Bearer 123')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.same(res.body, {}, 'Blank object, valid response');
      t.end();
    });
});

test('logout without Authorization', function (t) {
  request(boot(helpers.validBlankOptions()))
    .post('/auth/logout')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Authorization token is missing', 'Responds with missing token error');
      t.end();
    });
});

test('logout with incorrect Authorization', function (t) {
  request(boot(helpers.validBlankOptions()))
    .post('/auth/logout')
    .set('Authorization', 'Basic 123')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Invalid authorization scheme, expected \'Bearer\'', 'Responds with invalid token error');
      t.end();
    });
});
