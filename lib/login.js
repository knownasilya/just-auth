'use strict';

const deleteKey = require('key-del');
const get = require('lodash.get');
const createToken = require('./create-token');

module.exports = function (options) {
  return function (req, res) {
    let getUser = options.getUser;
    let validatePassword =
      options.validatePassword || require('./password').validate;
    let body = req.body;
    let idField = options.idField;
    let passwordField = options.passwordField;
    let passwordHashField = options.passwordHashField;
    let rememberMeField = options.rememberMeField;
    let rememberMe = get(body, rememberMeField);
    let id = get(body, idField);
    let password = get(body, passwordField);

    if (id && password) {
      getUser.call({ req: req }, id, function (err, user) {
        if (err) {
          return res.status(401).json(err);
        }

        let hash;

        if (user && get(user, passwordHashField)) {
          hash = get(user, passwordHashField);

          validatePassword(password, hash)
            .then(function (valid) {
              let token;

              if (valid) {
                deleteKey(user, passwordHashField, { copy: false });
                token = createToken(user, rememberMe, options);

                res.json({ token: token });
              } else {
                res.status(401).json('Unauthorized');
              }
            })
            .catch(function (error) {
              res.status(400).json(error.message);
            });
        } else {
          res.status(400).json('Invalid user data.');
        }
      });
    } else {
      res
        .status(400)
        .json(
          'Invalid arguments, expected `' +
            idField +
            '` and `' +
            passwordField +
            '` to be present.'
        );
    }
  };
};
