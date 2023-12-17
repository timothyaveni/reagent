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
import { getSecretForConsumerKey, handleLTI } from './auth/lti.js';

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

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    console.log('req', req);
    console.log('res', res);
    console.log('req.user', req.user);
    res.redirect('/');
  },
);

// this requires the LTI consumer and the reagent server to agree on the request protocol (http/https)
// for this to work, our TLS termination proxy needs to be trusted -- hence 'trust proxy' earlier
// make sure X-Forwarded-Proto is set to https in the proxy
passport.use(new LTIStrategy({
	// consumerKey: 'testconsumerkey',
	// consumerSecret: 'testconsumersecret'
	// pass the req object to callback
	// passReqToCallback: true,
	// https://github.com/omsmith/ims-lti#nonce-stores
	// nonceStore: new RedisNonceStore('testconsumerkey', redisClient)
  // TODO: we do care about the nonce, i suppose
  createProvider: async function(req, done) {
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
  }
}, function(lti, done) {
	// LTI launch parameters
	console.dir(lti);
	return done(null, lti); // this goes into req.lti
}));

app.post(
  '/auth/ltiv1p3',
  express.urlencoded({ extended: true }),
  passport.authenticate('lti', {
    assignProperty: 'lti', // req.lti will have the `done` callback value
  }),
  async function (req, res) {
    console.log('req', req.body, req.lti);
    let user;
    try {
      user = await handleLTI(req);
    } catch (err) {
      // missing LTI connection, for example
      console.log(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (user) {
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    } else {
      // set session
      req.session.lastLTILaunch = req.lti;
      res.redirect('/auth/ltiv1p3/new-account-interstitial');
    }
  },
);

// app.get(
//   '/auth/ltiv1p3/callback',
//   passport.authenticate('lti', { failureRedirect: '/login' }),
//   function (req, res) {
//     console.log('req', req);
//     console.log('res', res);
//     console.log('req.user', req.user);
//     res.redirect('/');
//   },
// );

if (process.env.NODE_ENV === 'development') {
  app.post('/auth/dev/login',
  express.urlencoded({ extended: true }),
  function (req, res, next) {
    if (req.body.password !== process.env.DEV_LOGIN_PASSWORD) {
      return res.redirect('/login');
    }

    req.login(
      {
        id: parseInt(req.body.id, 10),
      },
      (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      },
    );
  });
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
    getLoadContext: (req) => ({
      // @ts-expect-error todo
      user: req.user,
    }),
  }),
);

const port = process.env.PORT;
app.listen(port, () => console.log('http://localhost:' + port));
