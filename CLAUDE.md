# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

시놀로지 NAS Docker 환경에서 네트워크 동작을 검증하기 위한 **간단한 일기장 시스템**.
일기 CRUD + 로그인/로그아웃 + 사용자/관리자 화면 분리가 최소 기능이다.

## 설계 문서

모든 설계 문서는 `docs/` 폴더에 있다. **코드 수정 전 반드시 해당 문서를 참고**하고, 변경 사항이 생기면 `docs/changelog.md` 에 기록한다.

- `docs/domain.md` — 엔티티·권한·관계
- `docs/prd.md` — 요구사항·기술 스택·범위
- `docs/user-scenarios.md` — 주요 플로우 및 검증 시나리오
- `docs/tasks.md` — 작업 분할(WBS) 및 마일스톤
- `docs/changelog.md` — 모든 변경 이력

## 기술 스택 (제안, 승인 대기)

Node.js 20 + Express + SQLite (better-sqlite3) + EJS, 단일 Docker 컨테이너.
DB 파일은 호스트 볼륨(`./data`)에 마운트해 컨테이너 재시작 시에도 유지.

## 작업 원칙

- 문서를 먼저 업데이트한 뒤 코드 변경을 수행한다 (spec-first).
- `docs/changelog.md` 에 날짜·변경 내용을 반드시 남긴다.
- MVP 범위를 넘는 기능(첨부, 검색, 태그 등)은 PRD 에 없는 한 구현하지 않는다.
