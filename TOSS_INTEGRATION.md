# Toss Apps-in-Toss 연동 가이드

## 개요

DRONE WAR 게임에 Toss Apps-in-Toss를 연동하여 다음 기능을 제공합니다:
- 사용자 인증
- 게임 점수 저장
- 리더보드 조회
- mTLS 보안 통신

## 파일 구조

```
F:\GitHub\sirvivor\
├── certs/                      # mTLS 인증서 (gitignore에 등록됨)
│   ├── young_private.key       # 개인키
│   └── young_public.crt        # 공개 인증서
├── server.js                   # Express 서버 (mTLS 설정)
├── toss-integration.js         # 클라이언트 연동 모듈
├── package.json                # Node.js 의존성
└── index.html                  # 게임 (Toss 연동 추가)
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

필요한 패키지:
- `express` - 웹 서버
- `axios` - HTTP 클라이언트 (mTLS 지원)

### 2. 인증서 확인

인증서가 다음 경로에 있는지 확인:
```
./certs/young_private.key
./certs/young_public.crt
```

### 3. 서버 실행

```bash
npm start
```

또는 개발 모드 (nodemon):
```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 4. 게임 접속

브라우저에서 `http://localhost:3000` 접속

## API 엔드포인트

### 1. 사용자 정보 조회
```
GET /api/toss/user
Authorization: Bearer {token}
```

**Response:**
```json
{
  "userId": "user123",
  "name": "홍길동",
  "email": "user@example.com"
}
```

### 2. 게임 점수 저장
```
POST /api/toss/save-score
Authorization: Bearer {token}
Content-Type: application/json

{
  "score": 12500,
  "kills": 420,
  "time": 600000,
  "mode": "story",
  "stage": 2,
  "cleared": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score saved successfully",
  "data": {
    "score": 12500,
    "kills": 420,
    "time": 600000,
    "mode": "story",
    "stage": 2
  }
}
```

### 3. 리더보드 조회
```
GET /api/toss/leaderboard?mode=story&stage=1
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "Player1",
      "score": 10000,
      "kills": 500,
      "time": 600000
    },
    ...
  ]
}
```

## 클라이언트 연동

### 초기화

`toss-integration.js`가 자동으로 초기화됩니다:

```javascript
// 페이지 로드 시 자동 실행
window.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await tossIntegration.initialize();
    if (isAuthenticated) {
        console.log('✅ Toss 연동 완료');
    }
});
```

### 게임에서 사용

게임 종료 시 자동으로 점수 저장:

```javascript
function gameOver() {
    // ... 기존 코드 ...

    // Toss 점수 저장
    if (window.tossIntegration && window.tossIntegration.isAuthenticated) {
        window.tossIntegration.saveScore({
            score: finalKills * 10 + finalTime,
            kills: finalKills,
            time: gameTime,
            mode: gameMode,
            stage: selectedStage
        });
    }
}
```

## Toss 환경에서 테스트

### 1. URL 파라미터로 테스트

```
http://localhost:3000?token=YOUR_TEST_TOKEN
```

### 2. Toss 앱에서 실행

Toss 개발자 콘솔에서 Apps-in-Toss 등록 후:
```
toss://apps/{your-app-id}
```

## 보안 주의사항

### 1. 인증서 관리

**중요**: 인증서 파일은 절대 Git에 커밋하지 마세요!

`.gitignore`에 이미 등록되어 있습니다:
```gitignore
certs/
*.key
*.crt
*.pem
```

### 2. 환경 변수 사용 (권장)

프로덕션에서는 `.env` 파일 사용:

```bash
# .env
TOSS_CERT_PATH=/path/to/certs/young_public.crt
TOSS_KEY_PATH=/path/to/certs/young_private.key
TOSS_API_URL=https://api.toss.im
```

`server.js` 수정:
```javascript
require('dotenv').config();

const tossClientCert = fs.readFileSync(process.env.TOSS_CERT_PATH);
const tossClientKey = fs.readFileSync(process.env.TOSS_KEY_PATH);
```

### 3. HTTPS 사용

프로덕션 배포 시 HTTPS 필수:
```javascript
const https = require('https');
const httpsServer = https.createServer({
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem')
}, app);

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});
```

## 프로덕션 배포

### 1. 서버 설정

```bash
# PM2로 프로세스 관리
npm install -g pm2
pm2 start server.js --name drone-war
pm2 save
pm2 startup
```

### 2. Nginx 리버스 프록시

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Toss 개발자 콘솔 설정

1. [Toss 개발자 콘솔](https://developers.toss.im) 접속
2. Apps-in-Toss 앱 등록
3. Redirect URI 설정: `https://your-domain.com`
4. mTLS 인증서 등록 (young_public.crt)

## 문제 해결

### 인증서 오류

```
Error: unable to verify the first certificate
```

**해결**: 인증서 경로 확인 및 파일 권한 체크
```bash
ls -la certs/
chmod 600 certs/young_private.key
chmod 644 certs/young_public.crt
```

### CORS 오류

**해결**: `server.js`에 CORS 미들웨어 추가
```javascript
const cors = require('cors');
app.use(cors());
```

### 연결 거부

**해결**: 서버가 실행 중인지 확인
```bash
npm start
# 또는
node server.js
```

## 추가 기능 구현 아이디어

1. **데이터베이스 연동**
   - MongoDB/PostgreSQL로 점수 영구 저장
   - 실시간 리더보드

2. **결제 연동**
   - 캐릭터 구매 (Toss Payments)
   - 프리미엄 기능 해금

3. **소셜 기능**
   - 친구 점수 비교
   - 게임 공유하기

4. **푸시 알림**
   - 새 최고 기록 알림
   - 이벤트 알림

## 참고 문서

- [Toss Apps-in-Toss 개발 가이드](https://developers-apps-in-toss.toss.im/development/integration-process.html)
- [mTLS 인증 가이드](https://developers.toss.im/docs/mtls)
- [Express.js 문서](https://expressjs.com/)
- [Axios 문서](https://axios-http.com/)
