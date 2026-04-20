# 변경 이력 (Changelog)

문서·기능의 보완 및 수정 사항을 시간순으로 기록한다. 새 항목은 상단에 추가한다.

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
