'use strict';

var request = require('supertest');
var test = require('tape');
var boot = require('./bootstrap');

test('invalid #getUser', function (t) {
  t.throws(function () {
    boot()
  }, /getUser\(id, callback\)` function to be defined/, 'Missing function throws descriptive error');
  t.end();
});

test('login works', function (t) {
  t.plan(2);

  request(boot({
    getUser: function (id, cb) {
      cb(undefined, { email: id, passwordHash: '$2a$08$3hwGAN.NKAP/6VX3NdJ3zuDmEv0qfzXnOexwEzq2gT.rUk3ohx37y' });
    }
  }))
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'bacon' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.same(res.body, { user: { email: 'blah@blah' } }, 'User returned');
    });
});

test('invalid login body data', function (t) {
  t.plan(2);

  request(boot({
    getUser: function (id, cb) {
      cb(undefined, {});
    }
  }))
    .post('/auth/login')
    .send({ id: 'user', pass: 'blah' })
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Invalid arguments, expected `email` and `password` to be present.', 'Responds with required arguments');
    });
});
