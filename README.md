# just-auth [![Build Status](https://travis-ci.org/knownasilya/just-auth.png?branch=master)](https://travis-ci.org/knownasilya/just-auth)

**Don't use yet, this is still a work in progress.**

Simple token based authentication for Express.js.
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

app.use('/auth', justAuth({
  getUser: function (email, callback) {
    // if error: callback({ myerror: 'failure' });
    // if success: callback(undefined, { email: 'my@email', passwordHash: '%asdaq42ad..' });
  }
}));

app.listen(80);
```

POST to `/auth/login` with `{ email: 'my@email', password: 'bacon' }`.
Result will be JSON, e.g. `{ user: { email: 'my@email' } }`.


## Tests

```sh
npm install
npm test
```
```

> just-auth@0.0.0 test /Users/iradchenko/sandbox/just-auth
> node tests | tap-spec
  login works
    ✓ No error
    ✓ User returned
  invalid login body data
    ✓ No error
    ✓ Responds with required arguments
   
   
   
  total:     4
  passing:   4
  duration:  209ms
  All tests pass!
```

## Dependencies

- [bcrypt](https://github.com/ncb000gt/node.bcrypt.js): A bcrypt library for NodeJS.
- [body-parser](https://github.com/expressjs/body-parser): Node.js body parsing middleware
- [express](https://github.com/strongloop/express): Fast, unopinionated, minimalist web framework
- [extend](https://github.com/justmoon/node-extend): Port of jQuery.extend for node.js and the browser

## Dev Dependencies

- [supertest](https://github.com/visionmedia/supertest): Super-agent driven library for testing HTTP servers
- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers


## License

ISC

_Generated by [package-json-to-readme](https://github.com/zeke/package-json-to-readme)_
