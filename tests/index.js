'use strict';

var request = require('supertest');
var test = require('tape');
var boot = require('./bootstrap');
var helpers = require('./helpers');

test('invalid #getUser', function (t) {
  t.throws(function () {
    boot({
      invalidateUser: function () {}
    })
  }, /getUser\(id, callback\)` function to be defined/, 'Missing function throws descriptive error');
  t.end();
});

test('invalid #invalidateUser', function (t) {
  t.throws(function () {
    boot({
      getUser: function () {},
      updateUser: function () {}
    })
  }, /invalidateUser\(token, callback\)` function to be defined/, 'Missing function throws descriptive error');
  t.end();
});

test('login works', function (t) {
  t.plan(4);

  var options = helpers.validBlankOptions({
    email: '<id>',
    passwordHash: '$2a$08$3hwGAN.NKAP/6VX3NdJ3zuDmEv0qfzXnOexwEzq2gT.rUk3ohx37y'
  });

  request(boot(options))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.ok(res.body.user, 'Has user data');
      t.equal(res.body.user.email, 'blah@blah', 'Correct email');
      t.ok(res.body.user.token, 'Has token');
    });
});

test('invalid login body data', function (t) {
  t.plan(2);

  request(boot(helpers.validBlankOptions()))
    .post('/auth/login')
    .send({ id: 'user', pass: 'blah' })
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Invalid arguments, expected `email` and `password` to be present.', 'Responds with required arguments');
    });
});

test('logout responds to Bearer token', function (t) {
  t.plan(2);

  request(boot(helpers.validBlankOptions()))
    .post('/auth/logout')
    .set('Authorization', 'Bearer 123')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.same(res.body, {}, 'Blank object, valid response');
    });
});

test('logout without Authorization', function (t) {
  t.plan(2);

  request(boot(helpers.validBlankOptions()))
    .post('/auth/logout')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Authorization token is missing', 'Responds with missing token error');
    });
});

test('logout with incorrect Authorization', function (t) {
  t.plan(2);

  request(boot(helpers.validBlankOptions()))
    .post('/auth/logout')
    .set('Authorization', 'Basic 123')
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Invalid authorization scheme, expected \'Bearer\'', 'Responds with invalid token error');
    });
});
