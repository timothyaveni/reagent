import { unstable_viteServerBuildModuleId } from '@remix-run/dev';
import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';
import express from 'express';
import session from 'express-session';

import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import LTIStrategy from 'passport-lti';
import lti from 'ims-lti';

import { resolveGitHubAuth } from './auth/github.js';
import {
  getLTIConnectionForConsumerKey,
  getSecretForConsumerKey,
  handleLTI,
} from './auth/lti.js';

installGlobals();

const vite =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then(({ createServer }) =>
        createServer({
          server: {
            middlewareMode: true,
          },
        }),
      );

const app = express();

// handle asset requests
if (vite) {
  app.use(vite.middlewares);
} else {
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
  );
}
app.use(express.static('build/client', { maxAge: '1h' }));

// TODO:
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      // User.findOrCreate({ githubId: profile.id }, function (err, user) {
      //   return done(err, user);
      // });
      console.log({
        accessToken,
        refreshToken,
        profile,
      });
      const user = await resolveGitHubAuth(profile);
      console.log('user', user);
      return done(null, user);
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // secure: process.env.NODE_ENV === 'production', // TODO: probably need trust proxy
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// trust proxy:
app.set('trust proxy', 1);

// // print whether the connection is encrypted
// app.use(function (req, res, next) {
//   console.log('req.protocol', req.protocol);
//   next();
// });

app.get('/auth/login', function (req, res, next) {
  const { redirect } = req.query;

  if (redirect) {
    console.log('redirect', redirect);
    req.session.postLoginRedirect = redirect;
  } else {
    console.log('no redirect');
    req.session.postLoginRedirect = null;
  }

  req.session.save(() => {
    req.session.reload(() => {
      console.log('post-save', req.session);
      next();
    });
  });
});

const loginRedirect = (req, res) => {
  console.log('req.session 2', req.session);
  if (req.session.postLoginRedirect) {
    const redirect = req.session.postLoginRedirect;
    req.session.postLoginRedirect = null;
    return res.redirect(redirect); // todo if we're doing this in express we should strip host
  } else {
    return res.redirect('/');
  }
};

app.get(
  '/auth/github',
  (req, res, next) => {
    console.log('req.session 1', req.session);
    next();
  },
  passport.authenticate('github', { scope: ['user:email'], keepSessionInfo: true, }), // not sure this works. we should probably not do this anyway -- regen session i guess
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  function (req, res) {
    // console.log('req', req);
    // console.log('res', res);
    console.log('req.user', req.user);
    console.log('req.session', req.session);
    return loginRedirect(req, res);
  },
);

// this requires the LTI consumer and the reagent server to agree on the request protocol (http/https)
// for this to work, our TLS termination proxy needs to be trusted -- hence 'trust proxy' earlier
// make sure X-Forwarded-Proto is set to https in the proxy
passport.use(
  new LTIStrategy(
    {
      // consumerKey: 'testconsumerkey',
      // consumerSecret: 'testconsumersecret'
      // pass the req object to callback
      // passReqToCallback: true,
      // https://github.com/omsmith/ims-lti#nonce-stores
      // nonceStore: new RedisNonceStore('testconsumerkey', redisClient)
      // TODO: we do care about the nonce, i suppose
      createProvider: async function (req, done) {
        const consumerKey = req.body.oauth_consumer_key;
        try {
          console.log('consumerKey', consumerKey);
          const consumerSecret = await getSecretForConsumerKey(consumerKey);
          console.log('consumerSecret', consumerSecret);
          const provider = new lti.Provider(consumerKey, consumerSecret, null); // nonceStore
          return done(null, provider);
        } catch (err) {
          console.log('fail', err);
          return done('LTI connection not found', null);
        }
      },
    },
    function (lti, done) {
      // LTI launch parameters
      console.dir(lti);
      return done(null, lti); // this goes into req.lti
    },
  ),
);

app.post(
  '/auth/ltiv1p3',
  express.urlencoded({ extended: true }),
  passport.authenticate('lti', {
    assignProperty: 'lti', // req.lti will have the `done` callback value.
    // the 'right' way to do this is to let authenticate set the user object and do the redirect...
    // maybe i don't really need the passport module for LTI if i'm going to do it manually lol

    keepSessionInfo: true,
  }),
  async function (req, res) {
    console.log('req', req.body, req.lti);
    const ltiConnection = await getLTIConnectionForConsumerKey(
      req.body.oauth_consumer_key,
    );

    if (!ltiConnection) {
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }

    const user = await handleLTI(req, ltiConnection);

    if (user) {
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/'); // TODO: initial LTI launch login goes to the org page.. should they all?
      });
    } else {
      console.log({
        launchParams: req.lti,
        connectionId: ltiConnection.id,
      });
      // set session
      req.session.lastLTILaunch = {
        launchParams: req.lti,
        connectionId: ltiConnection.id,
      };
      req.session.save(() => {
        res.redirect('/auth/ltiv1p3/new-account-interstitial');
      });
    }
  },
);

// app.get(
//   '/auth/ltiv1p3/callback',
//   passport.authenticate('lti', { failureRedirect: '/auth/login' }),
//   function (req, res) {
//     console.log('req', req);
//     console.log('res', res);
//     console.log('req.user', req.user);
//     res.redirect('/');
//   },
// );

if (process.env.NODE_ENV === 'development') {
  app.post(
    '/auth/dev/login',
    express.urlencoded({ extended: true }),
    function (req, res, next) {
      if (req.body.password !== process.env.DEV_LOGIN_PASSWORD) {
        return res.redirect('/auth/login');
      }

      req.login(
        {
          id: parseInt(req.body.id, 10),
        },
        {
          keepSessionInfo: true,
        },
        (err) => {
          if (err) {
            return next(err);
          }
          return loginRedirect(req, res);
        },
      );
    },
  );
}

app.get('/logout', function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// handle SSR requests
app.all(
  '*',
  createRequestHandler({
    build: vite
      ? () => vite.ssrLoadModule(unstable_viteServerBuildModuleId)
      : await import('./build/server/index.js'),
    getLoadContext: (req) => {
      // console.log('glc req', req);
      return {
        user: req.user,
        session: req.session,
        loginNewUser: async (user) => {
          return await new Promise((resolve, reject) =>
            req.login(
              {
                id: user.id,
              },
              (err) => {
                if (err) {
                  // return next(err);
                  reject(err);
                }
                resolve();
              },
            ),
          );
        },
      };
    },
  }),
);

const port = process.env.PORT;
app.listen(port, () => console.log('http://localhost:' + port));
