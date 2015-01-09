'use strict';

module.exports = function (options) {
  var invalidateUser = options.invalidateUser;

  return function (req, res) {
    invalidateUser('ggg', function (err) {
      res.json({});
    });
  };
};
