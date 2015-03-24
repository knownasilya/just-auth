'use strict';

exports.validBlankOptions = function (user) {
  user = user || {};

  return {
    secret: '123f3mmm34',
    getUser: function (id, callback) {
      if (user.email === '<id>') {
        user.email = id;
      }

      process.nextTick(function () {
        callback(undefined, user);
      });
    },

    invalidateUser: function (token, callback) {
      process.nextTick(function () {
        callback(undefined);
      });
    },

    updateUser: function (user, callback) {
      process.nextTick(function () {
        callback(undefined, user);
      });
    }
  };
};
