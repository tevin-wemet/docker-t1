# 작업 분할 (WBS)

> 최종 수정: 2026-04-20

각 작업에는 예상 소요 시간과 선행 의존성을 표기한다. 체크박스로 진행 상태를 추적한다.

## Phase 0. 준비

- [x] **T0.1** 기술 스택 최종 승인 (Node.js + Express + SQLite) — 0.5h
- [x] **T0.2** 프로젝트 디렉터리 구조 초기화 (`src/`, `views/`, `public/`, `data/`) — 0.5h

## Phase 1. 백엔드 기반

- [x] **T1.1** `package.json` 작성 및 의존성 설치 (express, express-session, bcrypt, better-sqlite3, ejs) — 0.5h
- [x] **T1.2** SQLite 스키마 생성 스크립트 (`schema.sql`) 및 부트스트랩 로직 — 1h
- [x] **T1.3** 설정 로딩 (환경변수: `PORT`, `SESSION_SECRET`, `DB_PATH`) — 0.5h
- [x] **T1.4** 서버 엔트리포인트 (`src/app.js`) + 세션 미들웨어 — 1h

## Phase 2. 인증

- [x] **T2.1** 회원가입 API + 뷰 — 1h
- [x] **T2.2** 로그인 / 로그아웃 API + 뷰 — 1h
- [x] **T2.3** `requireAuth`, `requireAdmin` 미들웨어 — 0.5h

## Phase 3. 사용자 화면 (일기 CRUD)

- [x] **T3.1** 일기 목록 조회 (`GET /diary`) — 1h
- [x] **T3.2** 일기 상세 조회 (`GET /diary/:id`) — 0.5h
- [x] **T3.3** 일기 작성 (`GET/POST /diary/new`) — 1h
- [x] **T3.4** 일기 수정 (`GET/POST /diary/:id/edit`) — 1h
- [x] **T3.5** 일기 삭제 (`POST /diary/:id/delete`) — 0.5h
- [x] **T3.6** 소유권 검증 (타인 일기 접근 차단) — 0.5h

## Phase 4. 관리자 화면

- [x] **T4.1** 관리자 대시보드 라우트 (`/admin`) — 0.5h
- [x] **T4.2** 사용자 목록 / 삭제 / 비밀번호 초기화 — 1.5h
- [x] **T4.3** 전체 일기 조회 / 삭제 — 1h

## Phase 5. Docker 패키징

- [x] **T5.1** `Dockerfile` 작성 (multi-stage, node:20-alpine) — 1h
- [x] **T5.2** `docker-compose.yml` 작성 (볼륨 마운트 `./data:/app/data`) — 0.5h
- [x] **T5.3** `.dockerignore`, `.env.example` 작성 — 0.25h

## Phase 6. 검증

- [ ] **T6.1** 로컬(개발 PC)에서 `docker compose up` 으로 동작 확인 — 0.5h *(사용자 확인 대기)*
- [ ] **T6.2** 시놀로지 NAS 에 이미지 배포 및 실행 — 1h *(사용자 확인 대기)*
- [ ] **T6.3** 시나리오 N-1 (내부/외부망 접속, 재시작 영속성) 수행 — 0.5h *(사용자 확인 대기)*
- [x] **T6.4** 배포 가이드(`docs/deployment.md`) 및 검증 체크리스트 제공 — 0.25h

---

## 총 예상 공수

약 **16시간** (1인 기준, 집중 작업 시)

## 마일스톤

| 마일스톤 | 완료 조건 |
|----------|-----------|
| M1 — 로그인 동작 | Phase 1~2 완료 |
| M2 — 사용자 CRUD | Phase 3 완료 |
| M3 — 관리자 기능 | Phase 4 완료 |
| M4 — NAS 배포 검증 | Phase 5~6 완료 |

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-04-20 | 최초 작성 |
| 2026-04-20 | Phase 0~5 + T6.4 완료. T6.1~T6.3 은 실제 Docker Desktop / NAS 환경에서 사용자 검증 대기 |
