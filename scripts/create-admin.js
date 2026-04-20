#!/usr/bin/env node
const bcrypt = require('bcrypt');
const db = require('../src/db');

const BCRYPT_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--username' || a === '-u') args.username = argv[++i];
    else if (a === '--password' || a === '-p') args.password = argv[++i];
    else if (a === '--force' || a === '-f') args.force = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`사용법:
  npm run seed-admin -- --username <아이디> --password <비밀번호> [--force]

옵션:
  -u, --username   관리자 아이디 (3~20자 영문/숫자/_)
  -p, --password   비밀번호 (최소 ${PASSWORD_MIN_LENGTH}자)
  -f, --force      이미 존재하는 경우 비밀번호/역할을 admin 으로 덮어쓰기
  -h, --help       도움말 표시
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();

  if (!args.username || !args.password) {
    console.error('[오류] --username 과 --password 는 필수입니다.\n');
    usage();
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(args.username)) {
    console.error('[오류] 아이디는 3~20자의 영문/숫자/_ 만 허용됩니다.');
    process.exit(1);
  }
  if (args.password.length < PASSWORD_MIN_LENGTH) {
    console.error(`[오류] 비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`);
    process.exit(1);
  }

  const hash = bcrypt.hashSync(args.password, BCRYPT_ROUNDS);
  const existing = db.prepare('SELECT id, role FROM users WHERE username = ?').get(args.username);

  if (existing) {
    if (!args.force) {
      console.error(
        `[오류] 이미 '${args.username}' 사용자가 존재합니다. 덮어쓰려면 --force 를 추가하세요.`,
      );
      process.exit(1);
    }
    db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?").run(
      hash,
      existing.id,
    );
    console.log(`[완료] 기존 사용자 '${args.username}' 을(를) 관리자로 승격하고 비밀번호를 재설정했습니다.`);
  } else {
    db.prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')",
    ).run(args.username, hash);
    console.log(`[완료] 관리자 계정 '${args.username}' 을(를) 생성했습니다.`);
  }
  process.exit(0);
}

main();
