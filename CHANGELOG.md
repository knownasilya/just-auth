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
