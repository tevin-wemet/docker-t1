const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();
const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/diary');
  res.render('login', { error: null, username: '' });
});

router.post('/login', (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).render('login', {
      error: '아이디 또는 비밀번호가 올바르지 않습니다.',
      username,
    });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Session error');
    req.session.user = { id: user.id, username: user.username, role: user.role };
    req.session.save(() => {
      res.redirect(user.role === 'admin' ? '/admin' : '/diary');
    });
  });
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/diary');
  res.render('register', { error: null, username: '' });
});

router.post('/register', (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';
  const passwordConfirm = req.body.passwordConfirm || '';

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res
      .status(400)
      .render('register', { error: '아이디는 3~20자의 영문/숫자/_ 만 허용됩니다.', username });
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return res
      .status(400)
      .render('register', { error: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`, username });
  }
  if (password !== passwordConfirm) {
    return res
      .status(400)
      .render('register', { error: '비밀번호 확인이 일치하지 않습니다.', username });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).render('register', { error: '이미 사용 중인 아이디입니다.', username });
  }

  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  const info = db
    .prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')")
    .run(username, hash);

  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Session error');
    req.session.user = { id: info.lastInsertRowid, username, role: 'user' };
    req.session.save(() => res.redirect('/diary'));
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
