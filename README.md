# docker-t1 — 시놀로지 NAS 일기장

시놀로지 NAS Docker 환경 검증을 위한 간단한 일기장 시스템.

## 빠른 시작

```bash
# Docker 로 실행 (권장 — Windows/NAS 모두 동일하게 동작)
docker compose up -d

# 관리자 계정 생성 (최초 1회, 컨테이너 안에서)
docker compose exec app npm run seed-admin -- --username admin --password <비밀번호>
```

### 로컬 개발 (선택)

```bash
npm install
npm run dev
```

> **주의**: `better-sqlite3` 는 네이티브 모듈이라 Windows 로컬 설치 시 Visual Studio
> Build Tools (Desktop development with C++) 가 필요할 수 있다. 번거로우면 Docker
> 로만 개발·검증해도 된다.

## 문서

- [PRD](docs/prd.md)
- [도메인 정의](docs/domain.md)
- [사용자 시나리오](docs/user-scenarios.md)
- [작업 분할](docs/tasks.md)
- [배포 가이드](docs/deployment.md) — 시놀로지 NAS 배포 · QuickConnect · VPN · 검증 체크리스트
- [변경 이력](docs/changelog.md)

## 원격 저장소

https://github.com/tevin-wemet/docker-t1
