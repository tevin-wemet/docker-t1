const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAdmin);

const BCRYPT_ROUNDS = 10;
const TEMP_PASSWORD_LENGTH = 12;

router.get('/', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const entryCount = db.prepare('SELECT COUNT(*) AS n FROM diary_entries').get().n;
  res.render('admin/dashboard', { userCount, entryCount, flash: req.session.flash || null });
  req.session.flash = null;
});

router.get('/users', (req, res) => {
  const users = db
    .prepare(
      `SELECT u.id, u.username, u.role, u.created_at,
              (SELECT COUNT(*) FROM diary_entries d WHERE d.user_id = u.id) AS entry_count
         FROM users u
         ORDER BY u.created_at DESC`,
    )
    .all();
  res.render('admin/users', { users, flash: req.session.flash || null });
  req.session.flash = null;
});

router.post('/users/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.user.id) {
    req.session.flash = { type: 'error', message: '본인 계정은 삭제할 수 없습니다.' };
    return res.redirect('/admin/users');
  }
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  req.session.flash = info.changes
    ? { type: 'ok', message: '사용자가 삭제되었습니다 (해당 사용자의 일기도 함께 삭제).' }
    : { type: 'error', message: '해당 사용자를 찾을 수 없습니다.' };
  res.redirect('/admin/users');
});

router.post('/users/:id/reset-password', (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare('SELECT username FROM users WHERE id = ?').get(id);
  if (!target) {
    req.session.flash = { type: 'error', message: '해당 사용자를 찾을 수 없습니다.' };
    return res.redirect('/admin/users');
  }
  const tempPassword = generateTempPassword();
  const hash = bcrypt.hashSync(tempPassword, BCRYPT_ROUNDS);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
  req.session.flash = {
    type: 'ok',
    message: `${target.username} 의 임시 비밀번호: ${tempPassword} (사용자에게 안전하게 전달 후 즉시 변경 안내)`,
  };
  res.redirect('/admin/users');
});

router.get('/diary', (req, res) => {
  const entries = db
    .prepare(
      `SELECT d.id, d.title, d.entry_date, d.created_at, d.updated_at,
              u.username AS author, u.id AS author_id
         FROM diary_entries d
         JOIN users u ON u.id = d.user_id
         ORDER BY d.entry_date DESC, d.id DESC`,
    )
    .all();
  res.render('admin/diary', { entries, flash: req.session.flash || null });
  req.session.flash = null;
});

router.post('/diary/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM diary_entries WHERE id = ?').run(id);
  req.session.flash = info.changes
    ? { type: 'ok', message: '일기가 삭제되었습니다.' }
    : { type: 'error', message: '해당 일기를 찾을 수 없습니다.' };
  res.redirect('/admin/diary');
});

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

module.exports = router;
