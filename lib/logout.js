'use strict';

module.exports = function (options) {
  var invalidateUser = options.invalidateUser;

  return function (req, res) {
    // TODO: get token from header
    var token = 'ff';

    invalidateUser(token, function (err) {
      if (err) {
        return res.status(400).json('Invalidating user failed');
      }

      res.json({});
    });
  };
};
