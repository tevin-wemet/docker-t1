# 배포 가이드

시놀로지 NAS 에 일기장 서비스를 띄우고 네트워크 동작을 검증하는 절차를 정리한다.

---

## 1. 로컬 개발 PC 에서 먼저 확인

### 1.1 Docker Desktop 기동

Windows/Mac 에서 Docker Desktop 을 실행해 데몬이 떠 있어야 한다.

### 1.2 `.env` 파일 생성

```bash
cp .env.example .env
# .env 를 열어 SESSION_SECRET 값을 충분히 긴 난수 문자열로 교체
# 예시 생성: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 1.3 이미지 빌드 및 실행

```bash
docker compose build
docker compose up -d
docker compose logs -f app   # 로그 확인 (Ctrl+C 로 빠져나옴)
```

정상 기동 시 `http://localhost:3000` 에서 로그인 화면이 보인다.

### 1.4 관리자 계정 생성 (최초 1회)

```bash
docker compose exec app npm run seed-admin -- --username admin --password "충분히긴비밀번호"
```

생성 후 `/login` 에서 `admin` 으로 로그인하면 `/admin` 대시보드로 이동한다.

### 1.5 시나리오 검증

[user-scenarios.md](user-scenarios.md) 의 U-1 ~ U-4, A-1 ~ A-3 를 순서대로 수행한다. 모든 항목이 통과하면 로컬 검증 완료.

### 1.6 영속성 확인

```bash
docker compose down       # 컨테이너 중지/제거 (볼륨은 유지)
docker compose up -d      # 재기동
```

로그인 세션과 일기 데이터가 유지되어야 한다 (`./data/` 폴더에 `diary.db` 와 `sessions.db` 가 존재).

---

## 2. 시놀로지 NAS 배포

### 2.1 방식 선택

시놀로지는 두 가지 방식으로 Docker 컨테이너를 관리할 수 있다.

| 방식 | 특징 |
|------|------|
| **Container Manager (구 Docker 패키지)** GUI | DSM 웹 UI 로 이미지 import, 컨테이너 실행, 포트/볼륨 설정 |
| **SSH + `docker compose`** CLI | 이 저장소의 `docker-compose.yml` 을 그대로 재사용 가능. 권장 |

### 2.2 CLI 방식 (권장)

1. DSM 제어판 → 단말기 → SSH 서비스 활성화
2. SSH 로 NAS 접속 후 공유 폴더(`/volume1/docker/docker-t1` 등)에 저장소 clone

    ```bash
    sudo -i
    mkdir -p /volume1/docker/docker-t1
    cd /volume1/docker/docker-t1
    git clone https://github.com/tevin-wemet/docker-t1.git .
    cp .env.example .env
    nano .env   # SESSION_SECRET 변경, 필요 시 HOST_PORT 변경
    ```

3. 빌드 및 기동

    ```bash
    docker compose build
    docker compose up -d
    docker compose exec app npm run seed-admin -- --username admin --password "비밀번호"
    ```

4. 로컬(NAS 내부망) 확인: `http://<NAS_LAN_IP>:3000`

### 2.3 Container Manager GUI 방식

SSH 를 쓰지 않으려면 DSM Container Manager 에서 `docker-compose.yml` 을 "프로젝트" 로 가져와도 된다. 단 `.env` 의 `SESSION_SECRET` 은 반드시 설정해야 한다.

---

## 3. 외부 접속 구성

### 3.1 시놀로지 QuickConnect

1. DSM 제어판 → **외부 액세스 → QuickConnect** 활성화
2. QuickConnect ID 지정 (예: `my-nas`)
3. DSM 제어판 → **외부 액세스 → 고급 → 역방향 프록시** 규칙 추가
   - 소스: `diary.<quickconnect-id>.direct.quickconnect.to` (443, HTTPS)
   - 대상: `localhost:<HOST_PORT>`
4. Let's Encrypt 인증서 발급은 DSM 의 **보안 → 인증서** 에서 자동 처리

> **주의**: HTTPS 로 감싸지지 않은 외부 접근은 권장하지 않음. `NODE_ENV=production` 시 세션 쿠키는 `secure=true` 이므로 HTTPS 가 필수다.

### 3.2 VPN

가정 내 VPN (시놀로지 VPN Server 패키지) 을 통해 연결하면 LAN 주소 (`http://<NAS_LAN_IP>:3000`) 를 그대로 사용 가능하다.

1. DSM 패키지 센터에서 **VPN Server** 설치
2. OpenVPN / L2TP / WireGuard 중 선택 (WireGuard 가 최신·가장 빠름)
3. 클라이언트(PC/모바일)에 프로파일 등록 후 접속
4. VPN 접속 상태에서 NAS LAN IP 로 정상 접근 확인

> VPN 사용 시 HTTPS 가 필수는 아니지만, 쿠키 `secure=true` 때문에 HTTP 접근은 로그인 쿠키가 전달되지 않는다. **VPN 경로로만 쓸 거라면** `.env` 에 `NODE_ENV=development` 를 임시로 설정하거나, DSM 의 역방향 프록시로 HTTPS 종단을 두는 것이 좋다.

---

## 4. 네트워크 검증 체크리스트 (시나리오 N-1)

- [ ] 내부망 PC 브라우저 → `http://<NAS_LAN_IP>:<HOST_PORT>` 접속 성공
- [ ] 내부망 모바일 → 동일 주소 접속 성공
- [ ] VPN 연결 상태에서 외부 환경(4G/LTE) → 내부망 IP 접속 성공
- [ ] QuickConnect 주소 → 외부 환경(4G/LTE) 접속 성공
- [ ] `docker compose restart app` 후에도 일기 · 세션 유지 확인
- [ ] NAS 재부팅 후 컨테이너 자동 재시작 확인 (`restart: unless-stopped`)

---

## 5. 트러블슈팅

| 증상 | 원인 및 해결 |
|------|-------------|
| `SESSION_SECRET 를 .env 에 설정하세요` 오류로 기동 실패 | `.env` 에 `SESSION_SECRET=<긴 난수>` 지정 |
| better-sqlite3 네이티브 빌드 실패 | Windows 로컬 설치 시 발생 가능. Docker 경로로 진행 |
| 로그인이 유지되지 않음 | DSM 역방향 프록시 뒤라면 `X-Forwarded-Proto=https` 를 실제로 넘기는지 확인. 직접 HTTP 라면 앱이 `secure: 'auto'` + `trust proxy` 로 자동 판단하므로 LAN HTTP 도 정상 동작 |
| 외부에서 접속 불가 | 방화벽 / 포트포워딩 / DSM 방화벽 규칙 확인 |
| 일기/세션이 재시작 후 사라짐 | 볼륨 마운트(`./data:/app/data`) 경로가 정상인지, 호스트 디렉터리 권한(app 사용자, UID) 확인 |

---

## 6. 운영 팁

- **백업**: `./data/diary.db` 파일만 주기적으로 복사하면 전체 복구 가능 (SQLite)
- **로그**: `docker compose logs -f app` 으로 실시간 로그 확인
- **업데이트**:

    ```bash
    git pull
    docker compose build
    docker compose up -d
    ```
