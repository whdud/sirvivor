// Toss Apps-in-Toss 연동 모듈

class TossIntegration {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.authToken = null;
        this.isAdReady = false;
        this.userKey = null; // 게임용 유저 키
        this.adGroupId = null; // 광고 그룹 ID 저장용
    }

    // 게임용 사용자 키 가져오기 (Toss 전용 API)
    async getUserKeyForGame() {
        try {
            // Toss SDK가 로드되어 있는지 확인
            if (typeof getUserKeyForGame === 'function') {
                const result = await getUserKeyForGame();

                if (result && result.type === 'HASH') {
                    this.userKey = result.hash;
                    console.log('✅ 게임 유저 키 획득:', this.userKey);
                    return this.userKey;
                } else if (result === 'INVALID_CATEGORY') {
                    console.error('❌ 게임 카테고리가 아닙니다');
                    return null;
                } else {
                    console.error('❌ 유저 키 획득 실패:', result);
                    return null;
                }
            } else {
                // Toss SDK가 없는 경우 (로컬 테스트용 fallback)
                console.warn('⚠️ Toss SDK 없음 - 테스트 모드로 임시 키 생성');
                this.userKey = this.generateTestUserKey();
                return this.userKey;
            }
        } catch (error) {
            console.error('getUserKeyForGame 에러:', error);
            // 에러 발생 시 테스트 키 생성
            this.userKey = this.generateTestUserKey();
            return this.userKey;
        }
    }

    // 테스트용 임시 유저 키 생성
    generateTestUserKey() {
        // localStorage에서 기존 키 확인
        let testKey = localStorage.getItem('test_user_key');

        if (!testKey) {
            // 없으면 새로 생성
            testKey = 'test_' + Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15);
            localStorage.setItem('test_user_key', testKey);
        }

        return testKey;
    }

    // 친구 초대하고 하트 받기
    inviteFriends(onRewardReceived) {
        // contactsViral SDK가 없으면 테스트 모드
        if (typeof contactsViral === 'undefined') {
            console.warn('⚠️ contactsViral SDK not loaded - 테스트 모드');
            if (onRewardReceived) {
                setTimeout(() => onRewardReceived(1), 500);
            }
            return () => {};
        }

        try {
            // Module ID는 Toss 콘솔에서 설정 필요
            const cleanup = contactsViral({
                options: {
                    moduleId: 'YOUR_CONTACTS_VIRAL_MODULE_ID' // TODO: 콘솔에서 발급받은 ID로 교체
                },
                onEvent: (event) => {
                    console.log('친구 초대 이벤트:', event.type, event.data);

                    if (event.type === 'sendViral') {
                        // 친구 초대 성공 - 하트 보상
                        const rewardAmount = event.data.rewardAmount || 1;
                        console.log(`✅ 친구 초대 성공! 하트 ${rewardAmount}개 획득`);

                        if (onRewardReceived) {
                            onRewardReceived(rewardAmount);
                        }
                    } else if (event.type === 'close') {
                        console.log('친구 초대 닫힘:', event.data.closeReason);
                    }
                },
                onError: (error) => {
                    console.error('❌ 친구 초대 에러:', error);
                    alert('친구 초대 중 문제가 발생했어요. 다시 시도해주세요.');
                }
            });

            return cleanup;
        } catch (error) {
            console.error('친구 초대 에러:', error);
            return () => {};
        }
    }

    // Toss 인증 토큰 확인
    async initialize() {
        try {
            // 1. 게임 유저 키 먼저 가져오기 (리더보드용 필수)
            await this.getUserKeyForGame();

            // 2. URL에서 토큰 파라미터 확인 (Toss에서 제공)
            const urlParams = new URLSearchParams(window.location.search);
            this.authToken = urlParams.get('token') || sessionStorage.getItem('toss_token');

            if (this.authToken) {
                sessionStorage.setItem('toss_token', this.authToken);
                await this.fetchUserInfo();
                return true;
            }

            // 토큰이 없어도 유저 키가 있으면 게임은 플레이 가능
            return this.userKey !== null;
        } catch (error) {
            console.error('Toss initialization error:', error);
            return false;
        }
    }

    // 사용자 정보 조회
    async fetchUserInfo() {
        try {
            const response = await fetch('/api/toss/user', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                this.userInfo = await response.json();
                this.isAuthenticated = true;
                console.log('Toss user authenticated:', this.userInfo);
                return this.userInfo;
            } else {
                throw new Error('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Fetch user info error:', error);
            this.isAuthenticated = false;
            return null;
        }
    }

    // Toss Game Center에 점수 제출
    async submitGameCenterScore(score) {
        try {
            // Toss SDK가 로드되어 있는지 확인
            if (typeof submitGameCenterLeaderBoardScore === 'function') {
                const result = await submitGameCenterLeaderBoardScore({
                    score: score.toString()
                });

                if (!result) {
                    console.warn('⚠️ Toss 앱 버전이 낮아서 점수 제출 불가 (5.221.0 이상 필요)');
                    return false;
                }

                if (result.statusCode === 'SUCCESS') {
                    console.log('✅ Game Center 점수 제출 완료:', score);
                    return true;
                } else {
                    console.error('❌ Game Center 점수 제출 실패:', result);
                    return false;
                }
            } else {
                // Toss SDK가 없는 경우 (로컬 테스트용)
                console.warn('⚠️ Toss SDK 없음 - 테스트 모드 (점수 제출 시뮬레이션)');
                console.log('📊 제출할 점수:', score);
                return true;
            }
        } catch (error) {
            console.error('❌ Game Center 점수 제출 에러:', error);
            return false;
        }
    }

    // Toss Game Center 리더보드 열기
    async openGameCenterLeaderboard() {
        try {
            // Toss SDK가 로드되어 있는지 확인
            if (typeof openGameCenterLeaderboard === 'function') {
                await openGameCenterLeaderboard();
                console.log('✅ Game Center 리더보드 열림');
                return true;
            } else {
                // Toss SDK가 없는 경우 (로컬 테스트용)
                console.warn('⚠️ Toss SDK 없음 - 테스트 모드');
                alert('Toss 앱에서 실행 시 리더보드를 볼 수 있습니다.');
                return false;
            }
        } catch (error) {
            console.error('❌ Game Center 리더보드 열기 에러:', error);
            return false;
        }
    }


    // Toss 앱으로 돌아가기
    goBackToToss() {
        if (window.TossApps) {
            window.TossApps.close();
        } else {
            // Fallback: 브라우저에서 테스트 시
            console.log('Toss Apps SDK not available');
            window.history.back();
        }
    }

    // 결제 요청 (선택사항)
    async requestPayment(amount, orderName) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            // Toss Payments SDK 사용
            if (window.TossPayments) {
                const tossPayments = window.TossPayments('YOUR_CLIENT_KEY');
                await tossPayments.requestPayment('카드', {
                    amount: amount,
                    orderId: `DRONE_${Date.now()}`,
                    orderName: orderName,
                    customerName: this.userInfo?.name || 'Player',
                    successUrl: window.location.origin + '/payment/success',
                    failUrl: window.location.origin + '/payment/fail'
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            throw error;
        }
    }

    // 보상형 광고 로드
    async loadRewardedAd() {
        // Toss AdMob SDK가 없으면 스킵 (로컬 테스트 시)
        if (typeof loadAppsInTossAdMob === 'undefined') {
            console.warn('⚠️ Toss AdMob SDK not loaded (테스트 모드)');
            this.isAdReady = true; // 테스트를 위해 true로 설정
            return false;
        }

        // isSupported() 체크 (공식 문서 권장)
        if (typeof loadAppsInTossAdMob.isSupported === 'function' && !loadAppsInTossAdMob.isSupported()) {
            console.warn('⚠️ 현재 환경에서 AdMob을 지원하지 않습니다');
            return false;
        }

        try {
            // 테스트 ID 사용 (프로덕션에서는 콘솔에서 발급받은 실제 ID로 교체)
            this.adGroupId = 'ait-ad-test-rewarded-id';

            // 공식 문서 구조: options에 adGroupId 전달
            await loadAppsInTossAdMob({
                options: {
                    adGroupId: this.adGroupId
                },
                onEvent: (event) => {
                    if (event.type === 'loaded') {
                        console.log('✅ 보상형 광고 로드 완료', event.data);
                        this.isAdReady = true;
                    }
                },
                onError: (error) => {
                    console.error('❌ 광고 로드 실패:', error);
                    this.isAdReady = false;
                }
            });

            return true;
        } catch (error) {
            console.error('광고 로드 에러:', error);
            return false;
        }
    }

    // 보상형 광고 표시
    async showRewardedAd(onRewardEarned) {
        // Toss AdMob SDK가 없으면 바로 보상 지급 (로컬 테스트용)
        if (typeof showAppsInTossAdMob === 'undefined') {
            console.warn('⚠️ Toss AdMob SDK not loaded - 테스트 모드로 보상 지급');
            if (onRewardEarned) {
                setTimeout(() => onRewardEarned({ unitType: 'test', unitAmount: 1 }), 100);
            }
            return true;
        }

        // isSupported() 체크 (공식 문서 권장)
        if (typeof showAppsInTossAdMob.isSupported === 'function' && !showAppsInTossAdMob.isSupported()) {
            console.warn('⚠️ 현재 환경에서 AdMob을 지원하지 않습니다');
            alert('Toss 앱에서만 광고를 볼 수 있습니다.');
            return false;
        }

        if (!this.isAdReady) {
            console.warn('❌ 광고가 아직 준비되지 않았습니다');
            alert('광고를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return false;
        }

        if (!this.adGroupId) {
            console.error('❌ 광고 그룹 ID가 없습니다');
            return false;
        }

        try {
            // 공식 문서 구조: options에 adUnitId 전달
            await showAppsInTossAdMob({
                options: {
                    adUnitId: this.adGroupId
                },
                onEvent: (event) => {
                    console.log('📺 광고 이벤트:', event.type);

                    switch (event.type) {
                        case 'show':
                        case 'impression':
                            console.log('📺 광고 표시 중');
                            // Toss 가이드라인: 광고 재생 중 BGM 일시정지
                            if (typeof window.pauseAllAudio === 'function') {
                                window.pauseAllAudio();
                            }
                            break;

                        case 'dismissed':
                            console.log('광고 닫힘');
                            // Toss 가이드라인: 광고 종료 후 BGM 재개
                            if (typeof window.resumeAllAudio === 'function') {
                                window.resumeAllAudio();
                            }
                            this.isAdReady = false;
                            // 다음 광고 미리 로드
                            this.loadRewardedAd();
                            break;

                        case 'userEarnedReward':
                            console.log('✅ 보상 획득:', event.data);
                            // 보상 콜백 실행 (event.data.unitType, event.data.unitAmount)
                            if (onRewardEarned) {
                                onRewardEarned(event.data);
                            }
                            break;

                        case 'clicked':
                            console.log('광고 클릭됨');
                            break;

                        case 'failedToShow':
                            console.error('❌ 광고 표시 실패');
                            // 광고 실패 시에도 BGM 재개 (안전장치)
                            if (typeof window.resumeAllAudio === 'function') {
                                window.resumeAllAudio();
                            }
                            alert('광고를 표시할 수 없습니다. 다시 시도해주세요.');
                            break;
                    }
                },
                onError: (error) => {
                    console.error('❌ 광고 표시 에러:', error);
                    // 에러 발생 시에도 BGM 재개 (안전장치)
                    if (typeof window.resumeAllAudio === 'function') {
                        window.resumeAllAudio();
                    }
                    alert('광고를 표시할 수 없습니다. 다시 시도해주세요.');
                }
            });

            return true;
        } catch (error) {
            console.error('광고 표시 에러:', error);
            // 예외 발생 시에도 BGM 재개 (안전장치)
            if (typeof window.resumeAllAudio === 'function') {
                window.resumeAllAudio();
            }
            return false;
        }
    }
}

// 전역 인스턴스
const tossIntegration = new TossIntegration();

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await tossIntegration.initialize();

    if (isAuthenticated) {
        console.log('✅ Toss Apps-in-Toss 연동 완료');

        // 보상형 광고 미리 로드
        await tossIntegration.loadRewardedAd();

        // UI에 사용자 정보 표시 (선택사항)
        if (tossIntegration.userInfo) {
            document.body.setAttribute('data-toss-user', 'authenticated');
        }
    } else {
        console.log('ℹ️ Toss 인증 없음 (일반 모드)');
        // 로컬 테스트를 위해 광고도 로드
        await tossIntegration.loadRewardedAd();
    }
});
