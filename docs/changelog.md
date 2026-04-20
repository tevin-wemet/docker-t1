# 변경 이력 (Changelog)

문서·기능의 보완 및 수정 사항을 시간순으로 기록한다. 새 항목은 상단에 추가한다.

---

## 2026-04-20

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
