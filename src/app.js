const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const config = require('./config');
require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    store: new SQLiteStore({
      db: path.basename(config.sessionDbPath),
      dir: path.dirname(config.sessionDbPath),
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.get('/healthz', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/diary');
  res.redirect('/login');
});

app.use('/', require('./routes/auth'));

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

app.listen(config.port, config.host, () => {
  console.log(`diary-app listening on http://${config.host}:${config.port}`);
});
