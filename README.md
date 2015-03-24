# just-auth

[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]

**Don't use yet, this is still a work in progress.**

Simple SPA focused token based authentication for Express.js
This library follows convention over configuration, but configuration is available :wink:.

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
npm install just-auth --save
```


## Usage

```js
var express = require('express');
var justAuth = require('just-auth');
var app = express();
var auth = justAuth({
  secret: 'c47sRfunny101',

  getUser: function (email, callback) {
    // if error: callback({ myerror: 'failure' });
    // if success: callback(undefined, { email: 'my@email', passwordHash: '%asdaq42ad..' });
  },

  configureToken: function (user) {
    // user without passwordHash
    // return data you want set on the token
  }
});

app.use('/auth', auth.router);
app.use('/api/admin', auth.middleware);

app.listen(80);
```

POST to `/auth/login` with `{ email: 'my@email', password: 'bacon' }`.
Result will be JSON, e.g. `{ token: '2mkql3...' }`.

## Available Options

* `secret` - String, **required**.
* `loginEndpoint` - String, defaults to '/login'.
* `logoutEndpoint` - String, defaults to '/logout'.
* `idField` - String, defaults to 'email', the field name of the identifier for the user.
  The value of this field is passed to the `getUser` function.
* `passwordField` - String, defaults to 'password'.
* `passwordHashField` - String, defaults to 'passwordHash'.
* `tokenOptions` - Object, defaults to [this]().

### Methods

* `getUser` - Required; Function, `function (id, callback)`, should return a user object or an error via the callback.
* `configureToken` - Function, `function (user)`, should return the data that you want in the token, defaults to `user[idField]`.
* `validatePassword` - Function, `function (password, passwordHash)` should return `true` or `false`.
  By default this is `bcrypt.compareSync`.




## Tests

```sh
npm install
npm test
```
```

> just-auth@0.0.2 test /Users/iradchenko/sandbox/just-auth
> node tests | tap-spec
  secret not set
    ✓ Missing secret throws error
  invalid #getUser
    ✓ Missing function throws descriptive error
  login works
    ✓ No error
    ✓ Has token
  invalid login body data
    ✓ No error
    ✓ Responds with required arguments
  logout responds to Bearer token
    ✓ No error
    ✓ Blank object, valid response
  logout without Authorization
    ✓ No error
    ✓ Responds with missing token error
  logout with incorrect Authorization
    ✓ No error
    ✓ Responds with invalid token error



  total:     12
  passing:   12
  duration:  448ms
  All tests pass!
```

## Dependencies

- [auth-header](https://github.com/izaakschroeder/auth-header): For HTTP `Authorization` and `WWW-Authenticate` headers.
- [bcrypt](https://github.com/ncb000gt/node.bcrypt.js): A bcrypt library for NodeJS.
- [body-parser](https://github.com/expressjs/body-parser): Node.js body parsing middleware
- [express](https://github.com/strongloop/express): Fast, unopinionated, minimalist web framework
- [express-authentication](https://github.com/izaakschroeder/express-authentication): Unopinionated authentication middleware for express.
- [extend](https://github.com/justmoon/node-extend): Port of jQuery.extend for node.js and the browser
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken): JSON Web Token implementation (symmetric and asymmetric)

## Dev Dependencies

- [supertest](https://github.com/visionmedia/supertest): Super-agent driven library for testing HTTP servers
- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers


## License

ISC

_Generated by [package-json-to-readme](https://github.com/zeke/package-json-to-readme)_

[travis-badge]: https://travis-ci.org/knownasilya/just-auth.svg?branch=master
[travis-badge-url]: https://travis-ci.org/knownasilya/just-auth
[coveralls-badge]: https://coveralls.io/repos/knownasilya/just-auth/badge.svg?branch=master
[coveralls-badge-url]: https://coveralls.io/r/knownasilya/just-auth?branch=master
