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
        if (!user.email) {
          callback({err: 'fail' });
        }
        else {
          callback(undefined, user);
        }
      });
    }
  };
};
