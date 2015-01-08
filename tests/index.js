'use strict';

var request = require('supertest');
var test = require('tape');
var boot = require('./bootstrap');

test('login works', function (t) {
  t.plan(2);

  request(boot)
    .post('/auth/login')
    .send({ email: 'blah@blah', password: 'asd' })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'ok', 'Body is ok!');
    });
});

test('invalid login body data', function (t) {
  t.plan(2);

  request(boot)
    .post('/auth/login')
    .send({ id: 'user', pass: 'blah' })
    .expect('Content-Type', /json/)
    .expect(400)
    .end(function (err, res) {
      t.error(err, 'No error');
      t.equal(res.body, 'Invalid arguments, expected `email` and `password` to be present.', 'Responds with required arguments');
    });
});
