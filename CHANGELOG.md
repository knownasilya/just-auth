# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](https://github.com/knownasilya/just-auth/compare/v3.0.0...v4.0.0) (2020-12-16)


### ⚠ BREAKING CHANGES

* Drop Node.js < 10
* when supplying `Bearer` (no token) you now get a 400 instead of a 401. See middleware - no token test.

### Bug Fixes

* update deps and fix tests ([242a7c5](https://github.com/knownasilya/just-auth/commit/242a7c5cb22a50a81aaeb3e2457c4d749ee22320))

<a name="3.0.0"></a>
# [3.0.0](https://github.com/knownasilya/just-auth/compare/v2.0.1...v3.0.0) (2018-04-16)


### Bug Fixes

* update deps and fix tests ([048ca47](https://github.com/knownasilya/just-auth/commit/048ca47))
* update the readme and removve readme script ([6f09bb0](https://github.com/knownasilya/just-auth/commit/6f09bb0))


### BREAKING CHANGES

* some errors are not the same in regards to the output and maybe the statuscode (400 vs 401).



## v2.0.1 (07/11/2016)

- Add more tests
- Fix invalid hash verification error returning

## v2.0.0 (07/11/2016)

- Dependencies updated
- Add Changelog

### Breaking Changes

- `tokenOptions` now takes on expiration option, `expiresIn`, which is in seconds.

### Features

- `var auth = justAuth({})` now returns `auth.createToken(user, rememberMe)` as a helper function for testing.
