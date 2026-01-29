import passport from 'passport';
import {
  FACEBOOK_LOADING_PAGE_ENDPOINT,
  OAUTH_LODDING_PAGE_ENDPOINT,
  TWITTER_LOADING_PAGE_ENDPOINT,
} from '../application/endpoint';

const packer = (obj) => {
  const str = JSON.stringify(obj);
  const buff = new Buffer.from(str);
  const mess = buff.toString('base64');
  return mess.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
};

export const loginWithOAuth2 = async (req, res, next) => {
  try {
    passport.authenticate('oauth2')(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const oAuth2Callback = async (req, res, next) => {
  try {
    passport.authenticate('oauth2', { session: true }, (err, user, info) => {
      console.log('\n info :>> ', info);
      console.log('\n err :>> ', err);
      if (err) {
        const error = packer({ error: err.message, status: err.status });
        res.redirect(`${OAUTH_LODDING_PAGE_ENDPOINT}?error=${error}`);
      }
      if (user) {
        req.logIn(user, { session: true }, async (err) => {
          console.log('err ************ :>> ', err, user);
          if (err) {
            const error = packer({ error: err.message, status: err.status });
            res.redirect(`${OAUTH_LODDING_PAGE_ENDPOINT}?error=${error}`);
          }
          req.user = user;
          const info = packer({ data: user, status: 200 });
          res.redirect(`${OAUTH_LODDING_PAGE_ENDPOINT}?info=${info}`);
        });
      }
    })(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const loginWithFacebook = async (req, res, next) => {
  try {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const facebookCallback = async (req, res, next) => {
  try {
    passport.authenticate('facebook', { session: false }, (err, user, info) => {
      console.log('\n info :>> ', info);
      console.log('\n err :>> ', err);
      if (err) {
        const error = packer({ error: err.message, status: err.status });
        res.redirect(`${FACEBOOK_LOADING_PAGE_ENDPOINT}?error=${error}`);
      }
      if (user) {
        req.login(user, { session: false }, async (err) => {
          console.log('err ************ :>> ', err, user);
          if (err) {
            const error = packer({ error: err.message, status: err.status });
            res.redirect(`${FACEBOOK_LOADING_PAGE_ENDPOINT}?error=${error}`);
          }
          const info = packer({ data: user });
          res.redirect(`${FACEBOOK_LOADING_PAGE_ENDPOINT}?info=${info}`);
        });
      }
    })(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const loginWithTwitter = async (req, res, next) => {
  try {
    passport.authenticate('twitter')(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const twitterCallback = async (req, res, next) => {
  try {
    passport.authenticate('twitter', { session: false }, (err, user, info) => {
      console.log('\n info :>> ', info);
      console.log('\n err :>> ', err);
      if (err) {
        const error = packer({ error: err.message, status: err.status });
        res.redirect(`${TWITTER_LOADING_PAGE_ENDPOINT}?error=${error}`);
      }
      if (user) {
        req.login(user, { session: false }, async (err) => {
          console.log('err ************ :>> ', err, user);
          if (err) {
            const error = packer({ error: err.message, status: err.status });
            res.redirect(`${TWITTER_LOADING_PAGE_ENDPOINT}?error=${error}`);
          }
          const info = packer({ data: user });
          res.redirect(`${TWITTER_LOADING_PAGE_ENDPOINT}?info=${info}`);
        });
      }
    })(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const docusignAuth = async (req, res, next) => {
  try {
    passport.authenticate('docusign')(req, res, next);
  } catch (error) {
    console.log('\n error :>> ', error);
    next();
  }
};

export const docusignCallback = async (req, res, next) => {
  try {
    passport.authenticate('docusign', async (err, data, info) => {
      console.log('\n info :>> ', info);
      console.log('\n err :>> ', err);
      const successRedirectUrl = data?.eventConfig?.successRedirectUrl;
      const errorRedirectUrl = data?.eventConfig?.errorRedirectUrl;
      if (err) {
        console.error({ error: err.message, status: err.status });
        res.redirect(`${errorRedirectUrl}`);
      }
      if (data) {
        try {
          res.redirect(`${successRedirectUrl}`);
        } catch (err) {
          console.error({ error: err.message, status: err.status });
          res.redirect(`${errorRedirectUrl}`);
        }
      }
    })(req, res, next);
  } catch (error) {
    console.error('\n error :>> ', error);
    next();
  }
};
