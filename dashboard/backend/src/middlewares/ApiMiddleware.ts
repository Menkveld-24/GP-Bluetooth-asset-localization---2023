import passport from '@serviceproviders/AuthenticationServiceProvider';

export default passport.authenticate('bearer', { session: false, failWithError: true });
