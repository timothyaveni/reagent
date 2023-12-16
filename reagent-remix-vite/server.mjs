import { unstable_viteServerBuildModuleId } from '@remix-run/dev';
import { createRequestHandler } from '@remix-run/express';
import { installGlobals } from '@remix-run/node';
import express from 'express';
import session from 'express-session';

import passport from 'passport';
import GitHubStrategy from 'passport-github2';

import { resolveGitHubAuth } from './auth/github.js';

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
// the ol' body parser
app.use(express.urlencoded({ extended: true }));

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

if (process.env.NODE_ENV === 'development') {
  app.post('/auth/dev/login', function (req, res, next) {
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
