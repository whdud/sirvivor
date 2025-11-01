// Toss Apps-in-Toss 연동 모듈

class TossIntegration {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.authToken = null;
        this.isAdReady = false;
    }

    // Toss 인증 토큰 확인
    async initialize() {
        try {
            // URL에서 토큰 파라미터 확인 (Toss에서 제공)
            const urlParams = new URLSearchParams(window.location.search);
            this.authToken = urlParams.get('token') || sessionStorage.getItem('toss_token');

            if (this.authToken) {
                sessionStorage.setItem('toss_token', this.authToken);
                await this.fetchUserInfo();
                return true;
            }

            return false;
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

    // 게임 점수 저장
    async saveScore(scoreData) {
        if (!this.isAuthenticated) {
            console.warn('Not authenticated, skipping score save');
            return false;
        }

        try {
            const response = await fetch('/api/toss/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify(scoreData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Score saved:', result);
                return true;
            } else {
                throw new Error('Failed to save score');
            }
        } catch (error) {
            console.error('Save score error:', error);
            return false;
        }
    }

    // 리더보드 조회
    async getLeaderboard(mode, stage) {
        try {
            const params = new URLSearchParams({ mode, stage });
            const response = await fetch(`/api/toss/leaderboard?${params}`);

            if (response.ok) {
                const data = await response.json();
                return data.leaderboard;
            } else {
                throw new Error('Failed to fetch leaderboard');
            }
        } catch (error) {
            console.error('Leaderboard error:', error);
            return [];
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

        try {
            // 테스트 ID 사용 (프로덕션에서는 실제 ID로 교체)
            const adUnitId = 'ait-ad-test-rewarded-id';

            await loadAppsInTossAdMob({
                adUnitId: adUnitId,
                onAdLoaded: () => {
                    console.log('✅ 보상형 광고 로드 완료');
                    this.isAdReady = true;
                },
                onAdFailedToLoad: (error) => {
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
                setTimeout(() => onRewardEarned({ type: 'test', amount: 1 }), 100);
            }
            return true;
        }

        if (!this.isAdReady) {
            console.warn('❌ 광고가 아직 준비되지 않았습니다');
            alert('광고를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return false;
        }

        try {
            await showAppsInTossAdMob({
                onAdShown: () => {
                    console.log('📺 광고 표시 중');
                },
                onAdDismissed: () => {
                    console.log('광고 닫힘');
                    this.isAdReady = false;
                    // 다음 광고 미리 로드
                    this.loadRewardedAd();
                },
                onUserEarnedReward: (reward) => {
                    console.log('✅ 보상 획득:', reward);
                    // 보상 콜백 실행
                    if (onRewardEarned) {
                        onRewardEarned(reward);
                    }
                },
                onAdFailedToShow: (error) => {
                    console.error('❌ 광고 표시 실패:', error);
                    alert('광고를 표시할 수 없습니다. 다시 시도해주세요.');
                }
            });

            return true;
        } catch (error) {
            console.error('광고 표시 에러:', error);
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
