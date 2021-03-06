'use strict';

const request = require('supertest');
const express = require('express');
const test = require('tape');
const boot = require('./bootstrap');
const helpers = require('./helpers');
const lib = require('../');
const hash =
  'IAQAAAfQKUkNkhzJPUtnQ0ZutmxXAdmsoDGGFU1xb4DZELh1Qo0PpHfiddHMOPGvceLuaKuH';

test('secret not set', function (t) {
  t.throws(
    function () {
      boot({});
    },
    /just-auth requires a `secret`/,
    'Missing secret throws error'
  );
  t.end();
});

test('invalid #getUser', function (t) {
  t.throws(
    function () {
      boot({
        secret: 'test',
      });
    },
    /getUser\(id, callback\)` function to be defined/,
    'Missing function throws descriptive error'
  );
  t.end();
});

test('exports correct object on init', function (t) {
  const instance = lib({
    secret: 'blah',
    getUser: function (cb) {
      cb();
    },
  });

  t.ok(instance.router && instance.router.length === 3, 'has express router');
  t.ok(
    instance.middleware && instance.middleware.required,
    'has express-authentication middleware object'
  );
  t.equal(typeof instance.createToken, 'function', 'has createToken exported');

  t.end();
});

test('login works', function (t) {
  const jwt = require('jsonwebtoken');
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      //console.log(res);
      t.error(err, 'No error');
      t.ok(res.body.token, 'Has token');

      const decoded = jwt.verify(res.body.token, options.secret);
      t.equal(decoded.email, 'blah@blah', 'Token valid');

      t.end();
    });
});

test('login works - rememberMe', function (t) {
  const jwt = require('jsonwebtoken');
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });

  request(boot(options))
    .post('/auth/login')
    .send({
      email: 'blah@blah',
      password: 'bacon',
      rememberMe: true,
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.ok(res.body.token, 'Has token');

      const decoded = jwt.verify(res.body.token, options.secret);
      const timestamp = Math.floor(Date.now() / 1000);
      const expectedExpiration = timestamp + 60 * 60 * 24 * 14;

      t.equal(decoded.email, 'blah@blah', 'Token valid');
      t.equal(decoded.exp, expectedExpiration, 'Expiration is correct');

      t.end();
    });
});

test('login wrong password', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
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

test('login invalid hash', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: 'sdasd',
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err);
      t.equal(res.body, 'invalid hash length');
      t.end();
    });
});

test('login no hash', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
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
  const options = helpers.validBlankOptions({
    email: false,
    passwordHash:
      '$2a$08$3hwGAN.NKAP/6VX3NdJ3zuDmEv0qfzXnOexwEzq2gT.rUk3ohx37y',
  });
  const instance = lib(options);
  const app = express();
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
      t.equal(
        res.body,
        'Invalid arguments, expected `email` and `password` to be present.',
        'Responds with required arguments'
      );
      t.end();
    });
});

test('middleware', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });
  const instance = boot(options);
  const agent = request(instance);
  let token;

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
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });
  const instance = boot(options);
  const agent = request(instance);
  let token;

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
          t.equal(
            resp.body,
            "Invalid authorization scheme, expected 'Bearer'",
            'Invalid schema'
          );
          t.end();
        });
    });
});

test('middleware - invalid token', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });
  const instance = boot(options);
  const agent = request(instance);
  let token;

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
            error: 'AUTHENTICATION_REQUIRED',
          });
          t.end();
        });
    });
});

test('middleware - malformed token', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });
  const instance = boot(options);
  const agent = request(instance);

  agent
    .get('/admin')
    .set('Authorization', 'invalid')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (error, resp) {
      t.error(error);
      t.same(resp.body, 'Invalid authorization supplied');
      t.end();
    });
});

test('middleware - no token', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });
  const instance = boot(options);
  const agent = request(instance);

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
        .expect(400)
        .end(function (error, resp) {
          t.error(error);
          t.same(resp.body, 'Invalid authorization supplied');
          t.end();
        });
    });
});

test('middleware - auth missing', function (t) {
  const options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: hash,
  });
  const instance = boot(options);
  const agent = request(instance);

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
        .expect(400)
        .end(function (error, resp) {
          t.error(error);
          t.same(resp.body, 'Invalid authorization supplied');
          t.end();
        });
    });
});

test('password hash util', function (t) {
  const passwordUtil = require('../lib/password');

  passwordUtil.hash('abc', function (err, passHash) {
    t.error(err, 'No error');
    t.equal(typeof passHash, 'string', 'Hash is a string');
    t.ok(passwordUtil.validate('abc', passHash), 'Matches the password');
    t.end();
  });
});

test('createToken', function (t) {
  const instance = lib({
    secret: 'blah',
    getUser: function (cb) {
      cb();
    },
  });
  const token = instance.createToken({ blah: true }, false);

  t.ok(token, 'Token exists');
  t.end();
});
