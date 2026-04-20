-- 사용자
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 일기
CREATE TABLE IF NOT EXISTS diary_entries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT (date('now')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, entry_date DESC);
