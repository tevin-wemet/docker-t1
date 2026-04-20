# 변경 이력 (Changelog)

문서·기능의 보완 및 수정 사항을 시간순으로 기록한다. 새 항목은 상단에 추가한다.

---

## 2026-04-20 — Phase 6: 검증 및 배포 가이드

### 추가
- `docs/deployment.md` — 로컬 검증 → NAS 배포 → QuickConnect/VPN 설정 → 네트워크 검증 체크리스트 → 트러블슈팅 → 운영 팁
- `docs/tasks.md` 체크박스 진행률 업데이트 (Phase 0~5 완료, Phase 6 은 실기 검증 대기)
- README 의 문서 목록에 배포 가이드 링크 추가

### 유보 항목
- **T6.1 로컬 `docker compose up`**: Docker Desktop 미기동 상태라 실행 검증 못함
- **T6.2 NAS 배포**: NAS 원격 접근 필요
- **T6.3 내부/외부 접속 + 재시작 영속성**: 실제 네트워크 환경 필요

→ 세 항목 모두 사용자가 Docker Desktop / NAS 에서 `docs/deployment.md` 절차 따라 확인 후 본 changelog 에 결과 추가 예정.

### 최종 프로젝트 구조

```
docker-t1/
├── CLAUDE.md
├── README.md
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── docs/
│   ├── domain.md, prd.md, user-scenarios.md, tasks.md
│   ├── deployment.md
│   └── changelog.md
├── src/
│   ├── app.js, config.js, db.js, schema.sql
│   ├── middleware/auth.js
│   ├── routes/auth.js, diary.js, admin.js
│   └── views/
│       ├── login.ejs, register.ejs
│       ├── partials/header.ejs, footer.ejs
│       ├── diary/list.ejs, detail.ejs, form.ejs
│       └── admin/dashboard.ejs, users.ejs, diary.ejs
├── scripts/create-admin.js
├── public/style.css
└── data/     (gitignored — SQLite 파일 보관소)
```

---

## 2026-04-20 — Phase 5: Docker 패키징

### 추가
- `Dockerfile` — multi-stage (`node:20-alpine` 기반)
  - build stage 에서 네이티브 모듈 컴파일용 `python3/make/g++/sqlite` 설치 → `npm install --omit=dev`
  - runtime stage 는 tini + 비권한 `app` 사용자 + `/app/data` VOLUME
  - 내장 healthcheck: `wget /healthz`
- `docker-compose.yml` — 호스트 포트 `HOST_PORT` (기본 3000), `SESSION_SECRET` 필수, `./data` 볼륨 마운트
- `.dockerignore` — node_modules, .git, data, docs 등 제외

### 결정
- **이미지 베이스**: `node:20-alpine` (이미지 크기 최소화)
- **프로세스 슈퍼바이저**: `tini` (PID 1 신호 전달 문제 방지)
- **컨테이너 실행 사용자**: 비권한 `app` (UID 100+ 대, alpine 기본 adduser -S)
- **호스트 포트 설정**: `.env` 의 `HOST_PORT` 로 재매핑 가능 (시놀로지에서 다른 서비스와 충돌 시)
- **SESSION_SECRET 필수화**: compose 가 미설정 시 기동 실패시킴 (프로덕션 안전)

### 로컬 검증 유보
- Docker Desktop 미기동 상태라 로컬 이미지 빌드 검증은 Phase 6 에서 수행

---

## 2026-04-20 — Phase 4: 관리자 화면 + CLI seed

### 추가
- `src/routes/admin.js` — 대시보드 / 사용자 관리 / 전체 일기 관리
- `src/views/admin/dashboard.ejs`, `users.ejs`, `diary.ejs`
- `scripts/create-admin.js` — 관리자 계정 생성/승격 CLI
- `npm run seed-admin` 스크립트 엔트리

### 결정
- **본인 계정 보호**: 관리자는 자신의 계정을 삭제/수정할 수 없음 (UI + 서버 양쪽 차단)
- **비밀번호 초기화**: 12자 임시 비밀번호를 생성해 flash 메시지로 1회 노출. 관리자가 사용자에게 전달 후 즉시 변경 권고
- **계정 삭제**: FK CASCADE 로 해당 사용자의 일기도 함께 삭제
- **CLI 사용법**: `npm run seed-admin -- --username <아이디> --password <비밀번호> [--force]`
  - `--force`: 기존 일반 사용자를 관리자로 승격하고 비밀번호 재설정
- **Flash 메시지**: 세션에 1회성으로 저장 → 다음 요청에서 소비

---

## 2026-04-20 — Phase 3: 사용자 일기 CRUD

### 추가
- `src/routes/diary.js` — 목록/상세/작성/수정/삭제 + `loadOwnedEntry` 소유권 검증
- `src/views/diary/list.ejs`, `detail.ejs`, `form.ejs`

### 결정
- **제목 최대**: 200자, **본문 최대**: 20,000자
- **정렬**: `entry_date DESC, id DESC` (일기 날짜 역순, 같은 날짜는 최신 작성 순)
- **날짜 형식**: `YYYY-MM-DD` 검증
- **소유권 위반**: 타인 일기 접근 시 403 Forbidden
- **삭제**: 확인 다이얼로그(JS `confirm`) 후 POST

---

## 2026-04-20 — Phase 2: 인증

### 추가
- `src/middleware/auth.js` — `requireAuth`, `requireAdmin` 미들웨어
- `src/routes/auth.js` — 회원가입 / 로그인 / 로그아웃 라우트
- `src/views/login.ejs`, `src/views/register.ejs` — 인증 화면
- `src/views/partials/header.ejs`, `footer.ejs` — 공통 레이아웃 (include 방식)
- `public/style.css` — 전역 스타일

### 결정
- **회원가입**: 누구나 가입 가능 (MVP 기준). 초대제로 바꿀 경우 `/register` 라우트를 관리자 전용으로 이동
- **아이디 규칙**: 영문/숫자/`_` 3~20자
- **비밀번호 최소 길이**: 8자
- **세션 쿠키**: `HttpOnly` + `SameSite=Lax`, `NODE_ENV=production` 시 `secure=true` (HTTPS 필수)
- **관리자 로그인 시**: `/admin` 으로 리다이렉트 (화면은 Phase 4 에서 추가)

---

## 2026-04-20 — Phase 1: 백엔드 기반

### 추가
- `package.json` — express, express-session, connect-sqlite3, better-sqlite3, bcrypt, ejs
- `src/schema.sql` — users, diary_entries 스키마 + FK CASCADE + 인덱스
- `src/config.js` — 환경변수 기반 설정 (PORT/HOST/DB_PATH/SESSION_SECRET/DATA_DIR)
- `src/db.js` — SQLite 부트스트랩 (WAL 모드, FK ON, 스키마 자동 적용)
- `src/app.js` — Express 엔트리포인트 + EJS 뷰 엔진 + SQLite 세션 저장소
- `.env.example` — 배포 환경변수 템플릿

### 결정
- **세션 저장소**: SQLite 파일(`sessions.db`)로 영속화 → 컨테이너 재시작해도 로그인 유지
- **DB 디렉터리**: `./data` (호스트 볼륨 마운트 대상). 앱 DB(`diary.db`)와 세션 DB(`sessions.db`) 둘 다 이 아래 저장
- **로컬 개발 제약**: Windows 에서 `better-sqlite3` 네이티브 빌드 이슈 발생 가능 → Docker 로 검증 진행

---

## 2026-04-20 — Phase 0: 문서 및 초기 셋업

### 추가
- `docs/domain.md` — 도메인 정의서 최초 작성
- `docs/prd.md` — 제품 요구사항 문서 최초 작성
- `docs/user-scenarios.md` — 사용자 시나리오 최초 작성
- `docs/tasks.md` — 작업 분할(WBS) 최초 작성
- `docs/changelog.md` — 변경 이력 문서 신설

### 결정 (확정)
- **기술 스택 승인**: Node.js 20 + Express + SQLite(better-sqlite3) + EJS
- **배포 형태**: 단일 Docker 컨테이너 + `docker-compose.yml`, SQLite 파일은 호스트 볼륨 마운트
- **외부 접속**: VPN + 시놀로지 QuickConnect 양쪽 모두 지원
- **관리자 초기 계정**: CLI 커맨드로 생성 (`npm run seed-admin` 또는 `node scripts/create-admin.js`)
- **원격 저장소**: https://github.com/tevin-wemet/docker-t1
- **작업 흐름**: 각 Phase 완료 시마다 git commit + push

### 오픈 이슈 (해결됨)
- ~~외부 접속 방식~~ → VPN + QuickConnect 둘 다
- ~~관리자 초기 계정 생성 방법~~ → CLI 커맨드
