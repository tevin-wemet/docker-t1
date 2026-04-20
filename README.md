# docker-t1 — 시놀로지 NAS 일기장

시놀로지 NAS Docker 환경 검증을 위한 간단한 일기장 시스템.

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# Docker 로 실행
docker compose up -d

# 관리자 계정 생성 (최초 1회)
npm run seed-admin -- --username admin --password <비밀번호>
# (컨테이너 안에서는)
docker compose exec app npm run seed-admin -- --username admin --password <비밀번호>
```

## 문서

- [PRD](docs/prd.md)
- [도메인 정의](docs/domain.md)
- [사용자 시나리오](docs/user-scenarios.md)
- [작업 분할](docs/tasks.md)
- [변경 이력](docs/changelog.md)

## 원격 저장소

https://github.com/tevin-wemet/docker-t1
