/* eslint-disable no-prototype-builtins */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { authenticateUserWithExternalAPI } from './apiLogin';
import { authenticateUserWithProvider } from './authProviderLogin';
import { authenticateUserWithToken } from './jwtLogin';
import { authenticateUser } from './localLogin';
import { isTokenBlacklisted } from '../security/jwtUtils';

const localOptions = {
  usernameField: 'userName',
  passwordField: 'password',
  passReqToCallback: true,
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'addjsonwebtokensecretherelikeQuiscustodietipsoscustodesNew',
  algorithms: ['HS256'],
  passReqToCallback: true,
};

const validateJWTToken = async (req, jwt_payload, done) => {
  // Since we are here, the JWT is valid!
  try {
    // Extract token from request
    const token = jwtOptions.jwtFromRequest(req);
    // Check if the token is blacklisted
    const isInvalidToken = await isTokenBlacklisted(token);
    if (!isInvalidToken.isValid) return done(null, false, { message: isInvalidToken.message });
    //Pass the user details to the next middleware
    return done(null, jwt_payload);
  } catch (error) {
    done(error);
  }
};

const localStrategy = new LocalStrategy(localOptions, authenticateUser);
const authProviderStrategy = new LocalStrategy(localOptions, authenticateUserWithProvider);
const apiProviderStrategy = new LocalStrategy(localOptions, authenticateUserWithExternalAPI);
const jwtLoginStrategy = new JwtStrategy(jwtOptions, authenticateUserWithToken);
const verifyJWTStrategy = new JwtStrategy(jwtOptions, validateJWTToken);
/**
 * Combined Engine and Surface
 */
passport.use('local-login', localStrategy);
passport.use('auth-provider', authProviderStrategy);
passport.use('external-api-login', apiProviderStrategy);
passport.use('jwt-login', jwtLoginStrategy);
passport.use('jwt', verifyJWTStrategy);

passport.serializeUser((user, done) => {
  console.log('user serializeUser:>> ', user);
  const userDetailsWithRole = user.userDetails;
  userDetailsWithRole['role'] = user.role;
  userDetailsWithRole['token'] = user.token;
  if (user.hasOwnProperty('userSetting')) {
    userDetailsWithRole['userSetting'] = user.userSetting;
  }
  if (user.hasOwnProperty('tenant')) {
    userDetailsWithRole['tenant'] = user.tenant;
  }
  if (user.hasOwnProperty('subTenant')) {
    userDetailsWithRole['subTenant'] = user.subTenant;
  }
  console.log('==> Passport userDetailsWithRole', userDetailsWithRole);
  done(null, userDetailsWithRole);
});
passport.deserializeUser(async (req, obj, done) => {
  return done(null, obj);
});
export default passport;
