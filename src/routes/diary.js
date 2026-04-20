const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const MAX_TITLE = 200;
const MAX_CONTENT = 20000;

function loadOwnedEntry(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(404).send('Not Found');

  const entry = db.prepare('SELECT * FROM diary_entries WHERE id = ?').get(id);
  if (!entry) return res.status(404).send('Not Found');
  if (entry.user_id !== req.session.user.id) return res.status(403).send('Forbidden');

  req.entry = entry;
  next();
}

router.get('/', (req, res) => {
  const entries = db
    .prepare(
      'SELECT id, title, entry_date, updated_at FROM diary_entries WHERE user_id = ? ORDER BY entry_date DESC, id DESC',
    )
    .all(req.session.user.id);
  res.render('diary/list', { entries });
});

router.get('/new', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.render('diary/form', {
    mode: 'new',
    entry: { title: '', content: '', entry_date: today },
    error: null,
  });
});

router.post('/new', (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  const entry_date = (req.body.entry_date || '').trim();

  const err = validate({ title, content, entry_date });
  if (err) {
    return res.status(400).render('diary/form', {
      mode: 'new',
      entry: { title, content, entry_date },
      error: err,
    });
  }

  const info = db
    .prepare(
      'INSERT INTO diary_entries (user_id, title, content, entry_date) VALUES (?, ?, ?, ?)',
    )
    .run(req.session.user.id, title, content, entry_date);

  res.redirect(`/diary/${info.lastInsertRowid}`);
});

router.get('/:id', loadOwnedEntry, (req, res) => {
  res.render('diary/detail', { entry: req.entry });
});

router.get('/:id/edit', loadOwnedEntry, (req, res) => {
  res.render('diary/form', { mode: 'edit', entry: req.entry, error: null });
});

router.post('/:id/edit', loadOwnedEntry, (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  const entry_date = (req.body.entry_date || '').trim();

  const err = validate({ title, content, entry_date });
  if (err) {
    return res.status(400).render('diary/form', {
      mode: 'edit',
      entry: { ...req.entry, title, content, entry_date },
      error: err,
    });
  }

  db.prepare(
    "UPDATE diary_entries SET title = ?, content = ?, entry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(title, content, entry_date, req.entry.id);

  res.redirect(`/diary/${req.entry.id}`);
});

router.post('/:id/delete', loadOwnedEntry, (req, res) => {
  db.prepare('DELETE FROM diary_entries WHERE id = ?').run(req.entry.id);
  res.redirect('/diary');
});

function validate({ title, content, entry_date }) {
  if (!title) return '제목을 입력해주세요.';
  if (title.length > MAX_TITLE) return `제목은 ${MAX_TITLE}자 이내로 입력해주세요.`;
  if (!content) return '본문을 입력해주세요.';
  if (content.length > MAX_CONTENT) return `본문은 ${MAX_CONTENT}자 이내로 입력해주세요.`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) return '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD).';
  return null;
}

module.exports = router;
