# 도메인 정의서

> 최종 수정: 2026-04-20

## 1. 개요

시놀로지 NAS Docker 환경에서 네트워크 상으로 동작하는 간단한 일기장 시스템의 도메인 모델을 정의한다.

## 2. 핵심 엔티티

### 2.1 User (사용자)

| 속성 | 타입 | 설명 |
|------|------|------|
| id | INTEGER (PK) | 내부 식별자 |
| username | TEXT (UNIQUE) | 로그인 아이디 |
| password_hash | TEXT | bcrypt 해시된 비밀번호 |
| role | TEXT | `user` 또는 `admin` |
| created_at | DATETIME | 가입 일시 |

### 2.2 DiaryEntry (일기)

| 속성 | 타입 | 설명 |
|------|------|------|
| id | INTEGER (PK) | 내부 식별자 |
| user_id | INTEGER (FK → User.id) | 작성자 |
| title | TEXT | 제목 |
| content | TEXT | 본문 |
| entry_date | DATE | 일기 날짜 (사용자 지정) |
| created_at | DATETIME | 작성 일시 |
| updated_at | DATETIME | 최종 수정 일시 |

### 2.3 Session (세션)

세션 기반 인증을 사용하며 서버 메모리 또는 SQLite에 저장한다.

| 속성 | 타입 | 설명 |
|------|------|------|
| sid | TEXT (PK) | 세션 ID (쿠키 값) |
| user_id | INTEGER (FK) | 로그인한 사용자 |
| expires_at | DATETIME | 만료 시각 |

## 3. 관계

- `User 1 : N DiaryEntry` — 한 사용자가 여러 일기를 소유
- `User 1 : N Session` — 한 사용자가 여러 기기에서 로그인 가능

## 4. 권한 규칙

| 역할 | 자신의 일기 | 타인의 일기 | 사용자 관리 |
|------|-------------|-------------|-------------|
| user | CRUD | 접근 불가 | 불가 |
| admin | CRUD | 조회/삭제 | CRUD |

## 5. 상태 전이

일기 엔트리는 명시적 상태를 갖지 않으며 단순 CRUD 로만 관리한다 (MVP 범위).

## 6. 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-04-20 | 최초 작성 |
