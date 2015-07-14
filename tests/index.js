'use strict';

var request = require('supertest');
var express = require('express');
var test = require('tape');
var boot = require('./bootstrap');
var helpers = require('./helpers');
var lib = require('../');
var hash = 'IAQAAAfQKUkNkhzJPUtnQ0ZutmxXAdmsoDGGFU1xb4DZELh1Qo0PpHfiddHMOPGvceLuaKuH';

test('secret not set', function (t) {
  t.throws(function () {
    boot({});
  }, /just-auth requires a `secret`/, 'Missing secret throws error');
  t.end();
});

test('invalid #getUser', function (t) {
  t.throws(function () {
    boot({
      secret: 'test'
    });
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
    passwordHash: hash
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.ok(res.body.token, 'Has token');

      var decoded = jwt.verify(res.body.token, options.secret);
      t.equal(decoded.email, 'blah@blah', 'Token valid');

      t.end();
    });
});

test('login works - rememberMe', function (t) {
  var jwt = require('jsonwebtoken');
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });

  request(boot(options))
    .post('/auth/login')
    .send({
      email: 'blah@blah',
      password: 'bacon',
      rememberMe: true
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.ok(res.body.token, 'Has token');

      var decoded = jwt.verify(res.body.token, options.secret);
      var timestamp = Math.floor(Date.now() / 1000);
      var expectedExpiration = timestamp + (60 * 60 * 24 * 14);

      t.equal(decoded.email, 'blah@blah', 'Token valid');
      t.equal(decoded.exp, expectedExpiration, 'Expiration is correct');

      t.end();
    });
});

test('login wrong password', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'wrongpass' })
    .expect('Content-Type', /json/)
    .expect(401)
    .end(function (err, res) {
      t.error(err);
      t.equal(res.body, 'Unauthorized');
      t.end();
    });
});

test('login no hash', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>'
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err);
      t.equal(res.body, 'Invalid user data.');
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
    .expect(401)
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

test('middleware', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });
  var instance = boot(options);
  var agent = request(instance);
  var token;

  agent
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error for login');
      t.ok(res.body.token, 'Has token');

      token = res.body.token;

      agent
        .get('/admin')
        .set('Authorization', 'Bearer ' + token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (error, resp) {
          t.error(error, 'No error for restricted access');
          t.equal(resp.body, 'ok', 'Data accessed');
          t.end();
        });
    });
});

test('middleware - non bearer auth', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });
  var instance = boot(options);
  var agent = request(instance);
  var token;

  agent
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error for login');
      t.ok(res.body.token, 'Has token');

      token = res.body.token;

      agent
        .get('/admin')
        .set('Authorization', 'Tester ' + token)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (error, resp) {
          t.error(error, 'No error for restricted access');
          t.equal(resp.body, 'Invalid authorization scheme, expected \'Bearer\'', 'Invalid schema');
          t.end();
        });
    });
});

test('middleware - invalid token', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });
  var instance = boot(options);
  var agent = request(instance);
  var token;

  agent
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error for login');
      t.ok(res.body.token, 'Has token');

      token = 'invalid';

      agent
        .get('/admin')
        .set('Authorization', 'Bearer ' + token)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function (error, resp) {
          t.error(error);
          t.same(resp.body, {
            status: 401,
            statusCode: 401,
            error: 'AUTHENTICATION_REQUIRED'
          });
          t.end();
        });
    });
});

test('middleware - no token', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });
  var instance = boot(options);
  var agent = request(instance);

  agent
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error for login');
      t.ok(res.body.token, 'Has token');

      agent
        .get('/admin')
        .set('Authorization', 'Bearer ')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function (error, resp) {
          t.error(error);
          t.same(resp.body, { error: 'AUTHENTICATION_REQUIRED', status: 401, statusCode: 401 });
          t.end();
        });
    });
});

test('middleware - auth missing', function (t) {
  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash
  });
  var instance = boot(options);
  var agent = request(instance);

  agent
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error for login');
      t.ok(res.body.token, 'Has token');

      agent
        .get('/admin')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(function (error, resp) {
          t.error(error);
          t.same(resp.body, { error: 'AUTHENTICATION_REQUIRED', status: 401, statusCode: 401 });
          t.end();
        });
    });
});
