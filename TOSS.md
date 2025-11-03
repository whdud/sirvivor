# Toss Apps-in-Toss 연동 가이드

## 개요

이 게임은 **Toss 게임공모전**을 위해 `getUserKeyForGame()` API를 사용하여 사용자 식별과 데이터 저장을 구현했습니다.

- ✅ **서버 불필요**: 클라이언트 전용 localStorage 기반
- ✅ **토스 로그인 불필요**: 자동 사용자 해시 발급
- ✅ **일반 브라우저 호환**: 토스앱 밖에서도 정상 작동
- ✅ **보상형 광고 연동**: 게임 내 부활 시스템

---

## 주요 기능

### 1. 사용자 식별 (`getUserKeyForGame`)

```javascript
// toss-integration.js에서 자동 호출
const result = await getUserKeyForGame();
if (result?.type === 'HASH') {
  this.userKey = result.hash; // 고유 사용자 키
}
```

**작동 방식:**
- 토스앱 5.232.0 이상: `getUserKeyForGame()` 호출 → 고유 해시 발급
- 토스앱 5.232.0 미만: `local_user` 키로 폴백
- 일반 브라우저: `local_user` 키로 폴백

**사용자 키 활용:**
- localStorage 키: `dronewar_save_{userKey}`
- 점수 키: `dronewar_scores_{userKey}`
- 같은 토스 계정 = 같은 해시 = 데이터 공유

---

### 2. 게임 데이터 저장/로드

#### 게임 진행 데이터 저장
```javascript
// 캐릭터 언락, 골드 등 영구 데이터
tossIntegration.saveGameData({
  totalGold: 5000,
  unlockedCharacters: [0, 1, 2],
  unlockedStages: [0, 1]
});
```

#### 저장된 데이터 로드
```javascript
const data = await tossIntegration.loadGameData();
if (data) {
  console.log('저장된 골드:', data.totalGold);
}
```

**저장 구조:**
```json
{
  "totalGold": 5000,
  "unlockedCharacters": [0, 1, 2],
  "unlockedStages": [0, 1],
  "lastSaved": 1704067200000,
  "version": "1.0"
}
```

---

### 3. 점수/기록 저장

#### 게임 종료 시 자동 저장
게임 오버 시 자동으로 점수가 저장됩니다 (`index.html:6216`):

```javascript
tossIntegration.saveScore({
  score: finalKills * 10 + finalTime,
  kills: finalKills,
  time: finalTime,
  mode: gameMode,
  stage: selectedStage,
  character: selectedCharacter
});
```

#### 최고 기록 조회
```javascript
// 모든 모드의 최고 기록 10개
const bestScores = tossIntegration.getBestScores('all', 10);

// 스토리 모드만
const storyScores = tossIntegration.getBestScores('story', 10);

// 무한 모드만
const endlessScores = tossIntegration.getBestScores('endless', 10);
```

**저장된 점수 형식:**
```json
[
  {
    "score": 1250,
    "kills": 120,
    "time": 185,
    "mode": "story",
    "stage": 1,
    "character": 0,
    "timestamp": 1704067200000,
    "userKey": "abc123..."
  }
]
```

---

### 4. 보상형 광고 (부활 시스템)

#### 게임 오버 후 광고 보고 부활
```javascript
async function watchAdToRevive() {
  await tossIntegration.showRewardedAd((reward) => {
    // 보상 획득 시 처리
    player.hp = player.maxHp * 0.5;  // HP 50% 회복
    canRevive = false;  // 1회 한정
    invincible = true;
    invincibleTimer = 5000;  // 5초 무적
  });
}
```

**광고 시스템:**
- 토스 AdMob SDK 사용
- 테스트 ID: `ait-ad-test-rewarded-id`
- SDK 없을 때 (로컬 테스트): 자동 보상 지급
- 프로덕션 전 실제 AD Unit ID로 교체 필요

---

### 5. 게임센터 리더보드

토스 게임센터의 글로벌 리더보드에 점수를 제출하고 순위를 확인할 수 있습니다.

#### 점수 자동 제출
게임 오버 시 자동으로 리더보드에 점수가 제출됩니다 (`index.html:6236`):

```javascript
// 점수 계산: 격추 * 10 + 생존시간
const finalScore = finalKills * 10 + finalTime;

// 리더보드에 자동 제출
tossIntegration.submitLeaderboardScore(finalScore);
```

#### 리더보드 열기
메인 메뉴 또는 게임 오버 화면에서 "🏆 리더보드" 버튼 클릭:

```javascript
function openLeaderboard() {
  tossIntegration.openLeaderboard();
}
```

**리더보드 기능:**
- 전체 사용자 순위 확인
- 친구 순위 비교
- 내 점수 자랑하기 (공유)
- 점수 제출 시각 자동 기록

**점수 계산 공식:**
```
점수 = (격추 수 × 10) + 생존 시간(초)
```

**예시:**
- 격추 120대, 생존 185초 → 점수: 1,385점
- 격추 250대, 생존 300초 → 점수: 2,800점

**작동 환경:**
- 토스앱 5.221.0 이상: 실제 리더보드 표시
- 이전 버전 또는 브라우저: 안내 메시지 표시

**UI 버튼 위치:**
- 메인 메뉴: "🏆 리더보드" (금색 버튼)
- 게임 오버: "🏆 리더보드" (격추/시간 아래)

---

## 환경별 동작

| 환경 | userKey | 데이터 저장 | 광고 |
|------|---------|------------|------|
| 토스앱 5.232.0+ | 고유 해시 | localStorage | 실제 광고 |
| 토스앱 < 5.232.0 | `local_user` | localStorage | 테스트 광고 |
| 일반 브라우저 | `local_user` | localStorage | 테스트 광고 |

---

## 개발/테스트 방법

### 로컬 브라우저에서 테스트

1. `index.html` 열기
2. F12 개발자 도구 콘솔 확인:
   ```
   ℹ️ getUserKeyForGame 없음 (일반 브라우저 모드)
   ✅ 일반 브라우저 모드
   ```

3. localStorage 확인:
   ```javascript
   // 저장된 게임 데이터
   localStorage.getItem('dronewar_save_local_user')

   // 저장된 점수들
   localStorage.getItem('dronewar_scores_local_user')
   ```

### 토스앱에서 테스트

1. Toss 개발자 센터에서 미니앱 등록
2. 게임 카테고리로 설정
3. 테스트 URL 등록 후 토스앱에서 실행
4. 콘솔 확인:
   ```
   ✅ Toss 사용자 키 획득: abc12345...
   ✅ Toss Apps-in-Toss 모드 (사용자 키: abc12345...)
   ```

---

## API 레퍼런스

### `tossIntegration.initialize()`
초기화 함수. 페이지 로드 시 자동 호출됨.

**반환:** `Promise<boolean>`

### `tossIntegration.saveGameData(data)`
게임 진행 데이터 저장.

**파라미터:**
- `data` (Object): 저장할 데이터

**반환:** `boolean`

### `tossIntegration.loadGameData()`
저장된 게임 데이터 로드.

**반환:** `Promise<Object | null>`

### `tossIntegration.saveScore(scoreData)`
게임 점수 저장.

**파라미터:**
- `scoreData` (Object):
  - `score` (number): 총 점수
  - `kills` (number): 격추 수
  - `time` (number): 생존 시간 (초)
  - `mode` (string): 게임 모드 ('story', 'endless')
  - `stage` (number): 스테이지 번호
  - `character` (number): 선택 캐릭터

**반환:** `boolean`

### `tossIntegration.getBestScores(mode, limit)`
최고 기록 조회.

**파라미터:**
- `mode` (string): 'all', 'story', 'endless'
- `limit` (number): 개수 (기본 10)

**반환:** `Array<Object>`

### `tossIntegration.showRewardedAd(onRewardEarned)`
보상형 광고 표시.

**파라미터:**
- `onRewardEarned` (Function): 보상 획득 콜백

**반환:** `Promise<boolean>`

### `tossIntegration.resetGameData()`
게임 진행 데이터만 초기화.

**반환:** `boolean`

### `tossIntegration.resetAllData()`
게임 데이터 + 점수 전체 초기화.

**반환:** `boolean`

### `tossIntegration.submitLeaderboardScore(score)`
토스 게임센터 리더보드에 점수 제출.

**파라미터:**
- `score` (number): 제출할 점수

**반환:** `Promise<Object>`
- `{ success: true, score: number }` - 제출 성공
- `{ success: false, mode: 'browser' }` - 브라우저 모드
- `{ success: false, mode: 'version' }` - 토스앱 버전 부족
- `{ success: false, error: string }` - 에러 발생

**최소 요구 버전:** 토스앱 5.221.0

### `tossIntegration.openLeaderboard()`
토스 게임센터 리더보드 화면 열기.

**반환:** `boolean`
- `true` - 리더보드 열기 성공
- `false` - 실패 (브라우저 모드 또는 버전 부족)

**최소 요구 버전:** 토스앱 5.221.0

**주의사항:**
- 게임 진입 직후 바로 호출 시 화면이 겹칠 수 있음
- 미니앱 정보 승인 필요 (미승인 시 에러 발생)

### `tossIntegration.goBackToToss()`
토스앱으로 돌아가기 (토스앱 환경일 때만 작동).

---

## 프로덕션 체크리스트

### 배포 전 필수 작업

- [ ] **광고 Unit ID 교체**: `toss-integration.js:167`
  ```javascript
  const adUnitId = 'YOUR_ACTUAL_AD_UNIT_ID'; // 실제 ID로 교체
  ```

- [ ] **토스 개발자 센터 설정**:
  - 미니앱 등록
  - 카테고리: 게임
  - 프로덕션 URL 등록
  - 광고 Unit ID 발급

- [ ] **테스트 시나리오**:
  - [ ] 토스앱에서 게임 실행
  - [ ] 게임 오버 후 점수 저장 확인
  - [ ] 리더보드 점수 제출 확인 (콘솔에서 "🏆 리더보드 점수 제출 완료" 확인)
  - [ ] 메인 메뉴/게임 오버에서 리더보드 열기 테스트
  - [ ] 부활 광고 시청 테스트
  - [ ] 게임 종료 후 재실행 → 데이터 복원 확인

- [ ] **데이터 마이그레이션**:
  - 기존 사용자가 있다면 데이터 이전 로직 필요
  - localStorage 키 충돌 방지 확인

---

## 문제 해결

### Q: `getUserKeyForGame is not a function` 에러
**A:** 토스앱 환경이 아니거나 버전이 낮습니다. 자동으로 `local_user` 키로 폴백되어 정상 작동합니다.

### Q: 광고가 표시되지 않음
**A:** 로컬 테스트 시 정상입니다. 토스앱에서는 AdMob SDK가 로드되어야 합니다.

### Q: 데이터가 사라짐
**A:** localStorage 용량 초과 또는 브라우저 데이터 삭제. 추후 서버 백업 기능 추가 권장.

### Q: 다른 기기에서 데이터 공유 안 됨
**A:** localStorage는 기기별 저장입니다. 클라우드 동기화가 필요하면 Firebase 등 추가 필요.

### Q: 리더보드가 열리지 않음
**A:**
1. 토스앱 버전 확인 (5.221.0 이상 필요)
2. 미니앱 정보 승인 상태 확인 (토스 개발자 센터)
3. 브라우저 테스트 시 정상 (안내 메시지만 표시)

### Q: 리더보드에 점수가 반영되지 않음
**A:**
1. 콘솔에서 "🏆 리더보드 점수 제출 완료" 메시지 확인
2. 미니앱이 게임 카테고리로 등록되었는지 확인
3. 점수 제출 시 토스 서버 응답 확인 (statusCode: 'SUCCESS')
4. 토스 게임센터에서 리더보드 새로고침

---

## 향후 개선 사항

1. **클라우드 세이브**: 멀티 디바이스 지원 (Firebase/Supabase)
2. **친구 대전**: Toss 친구 목록 연동
3. **푸시 알림**: 이벤트/업데이트 알림
4. **인앱 결제**: Toss Payments 연동 (스킨, 아이템)
5. **모드별 리더보드**: 스토리/무한 모드 분리, 스테이지별 순위

---

## 참고 문서

- [Toss getUserKeyForGame API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/getUserKeyForGame.html)
- [Toss submitGameCenterLeaderBoardScore API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/submitGameCenterLeaderBoardScore.html)
- [Toss openGameCenterLeaderboard API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B2%8C%EC%9E%84/openGameCenterLeaderboard.html)
- [Toss AdMob 가이드](https://developers-apps-in-toss.toss.im/)
- [Toss Apps SDK](https://developers-apps-in-toss.toss.im/)

---

**작성일:** 2025-11-03
**버전:** 1.1 (리더보드 추가)
**게임:** DRONE WAR (드론 워)
