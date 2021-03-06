# just-auth

[![NPM][npm-badge-img]][npm-badge-link]
[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]

Simple SPA focused token based authentication for Express.js
This library follows convention over configuration, but configuration is available :wink:.

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
npm install just-auth --save
```


## Usage

```js
const express = require('express');
const justAuth = require('just-auth');
const app = express();
const auth = justAuth({
  secret: 'c47sRfunny101',

  getUser(email, callback) {
    // if error: callback({ myerror: 'failure' });
    // if success: callback(undefined, { email: 'my@email', passwordHash: '%asdaq42ad..' });
  },

  // Default behavior (don't specify if this suites you)
  configureToken(user) {
    // user without passwordHash
    return user;
  }
});

app.use('/auth', auth.router);

// Can also use `succeeded()` and `failed()` for redirects, etc.
// See https://www.npmjs.com/package/express-authentication
app.use('/api/admin', auth.middleware.required());

app.listen(80);
```

POST to `/auth/login` with `{ email: 'my@email', password: 'bacon' }`.
Result will be JSON, e.g. `{ token: '2mkql3...' }`.

_Note: To use the built in password utilities, you can use the following:_

```js
const passUtils = require('just-auth/lib/password');

const isValid = passUtils.validate(pass, hash);

passUtils.hash(pass, function (err, hash) {
  // error or hash
});
```


## Available Options

* `secret` - String, **required**.
* `loginEndpoint` - String, defaults to '/login'.
* `idField` - String, defaults to 'email', the field name of the identifier for the user.
  The value of this field is passed to the `getUser` function.
* `passwordField` - String, defaults to 'password'.
* `passwordHashField` - String, defaults to 'passwordHash'.
* `rememberMeField` - String, defaults to 'rememberMe'.
* `rememberMeAdditionalMinutes` - Number, defaults to 13 days in minutes.
* `tokenOptions` - Object, defaults to [this](https://github.com/knownasilya/just-auth/blob/master/index.js#L16). See full options
  [here](https://github.com/auth0/node-jsonwebtoken/tree/v7.0.0#jwtsignpayload-secretorprivatekey-options-callback).

### Methods

* `getUser` - **Required**; Function, `function (id, callback)`, should return a user object or an error via the callback.
* `configureToken` - Function, `function (user)`, should return the data that you want in the token, defaults to `user` if not specified.
* `validatePassword` - Function, `function (password, passwordHash)` should return a promise.
  By default this is `pbkdf2Utils.verify`, see [here](https://www.npmjs.com/package/pbkdf2-utils).


## Tests

```sh
npm install
npm test
````

## License

ISC

[npm-badge-img]: https://badge.fury.io/js/just-auth.svg
[npm-badge-link]: http://badge.fury.io/js/just-auth
[travis-badge]: https://travis-ci.org/knownasilya/just-auth.svg?branch=master
[travis-badge-url]: https://travis-ci.org/knownasilya/just-auth
[coveralls-badge]: https://coveralls.io/repos/knownasilya/just-auth/badge.svg?branch=master
[coveralls-badge-url]: https://coveralls.io/r/knownasilya/just-auth?branch=master
