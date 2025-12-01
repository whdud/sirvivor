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
            console.log('🔑 게임 유저 키 요청 시작');

            // Toss SDK가 로드되어 있는지 확인 (window 명시적 참조)
            const getUserKeyFunc = window.getUserKeyForGame;
            if (typeof getUserKeyFunc === 'function') {
                console.log('✓ getUserKeyForGame 함수 발견');
                const result = await getUserKeyFunc();

                console.log('📨 getUserKeyForGame 응답:', result);

                if (result && result.type === 'HASH') {
                    this.userKey = result.hash;
                    console.log('✅ 게임 유저 키 획득:', this.userKey);
                    return this.userKey;
                } else if (result === 'INVALID_CATEGORY') {
                    console.error('❌ 게임 카테고리가 아닙니다');
                    console.error('→ Toss 개발자 콘솔에서 앱 카테고리를 "게임"으로 설정해주세요!');
                    // 카테고리 오류여도 임시 키로 게임은 플레이 가능하게
                    this.userKey = this.generateTestUserKey();
                    return this.userKey;
                } else {
                    console.error('❌ 유저 키 획득 실패:', result);
                    this.userKey = this.generateTestUserKey();
                    return this.userKey;
                }
            } else {
                // Toss SDK가 없는 경우 (로컬 테스트용 fallback)
                console.warn('⚠️ Toss SDK 없음 - 테스트 모드로 임시 키 생성');
                console.log('typeof getUserKeyForGame:', typeof getUserKeyForGame);
                this.userKey = this.generateTestUserKey();
                return this.userKey;
            }
        } catch (error) {
            console.error('getUserKeyForGame 에러:', error);
            console.error('에러 상세:', error.message, error.stack);
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

    // SDK 가용성 체크 메서드들
    isLeaderboardAvailable() {
        return typeof window.openGameCenterLeaderboard === 'function';
    }

    isAdAvailable() {
        return typeof window.GoogleAdMob !== 'undefined' &&
               typeof window.GoogleAdMob.loadAppsInTossAdMob === 'function' &&
               typeof window.GoogleAdMob.showAppsInTossAdMob === 'function';
    }

    isInviteFriendsAvailable() {
        return typeof window.contactsViral === 'function';
    }

    // 전체 SDK 가용성 체크
    isTossSDKAvailable() {
        return this.isLeaderboardAvailable() || this.isAdAvailable() || this.isInviteFriendsAvailable();
    }

    // 환경 정보 가져오기
    getEnvironmentInfo() {
        return {
            env: window.getOperationalEnvironment ? window.getOperationalEnvironment() : 'unknown',
            tossVersion: window.getTossAppVersion ? window.getTossAppVersion() : 'unknown',
            platform: window.getPlatformOS ? window.getPlatformOS() : 'unknown',
            leaderboard: this.isLeaderboardAvailable(),
            ad: this.isAdAvailable(),
            invite: this.isInviteFriendsAvailable()
        };
    }

    // 친구 초대하고 하트 받기
    inviteFriends(onRewardReceived) {
        // contactsViral SDK가 없으면 테스트 모드 - window 명시적 참조
        const contactsViralFunc = window.contactsViral;
        if (typeof contactsViralFunc === 'undefined') {
            console.warn('⚠️ contactsViral SDK not loaded - 테스트 모드');
            if (onRewardReceived) {
                setTimeout(() => onRewardReceived(1), 500);
            }
            return () => {};
        }

        try {
            // Module ID는 Toss 콘솔에서 설정 필요
            const cleanup = contactsViralFunc({
                options: {
                    moduleId: '4448b227-295f-42a7-bb67-b7c6a922bd4f'
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
                    if (window.showTossModal) {
                        window.showTossModal({
                            title: '친구 초대 오류',
                            message: '친구 초대 중 문제가 발생했어요.\n다시 시도해주세요.',
                            buttons: [{text: '확인', color: 'secondary'}]
                        });
                    }
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
            console.log('🎮 Game Center 점수 제출 시도:', score);

            // Toss SDK가 로드되어 있는지 확인 (window 명시적 참조)
            const submitFunc = window.submitGameCenterLeaderBoardScore;
            if (typeof submitFunc === 'function') {
                console.log('✓ submitGameCenterLeaderBoardScore 함수 발견');

                const result = await submitFunc({
                    score: score.toString()
                });

                console.log('📨 API 응답:', result);

                if (!result) {
                    console.warn('⚠️ Toss 앱 버전이 낮아서 점수 제출 불가 (5.221.0 이상 필요)');
                    return false;
                }

                if (result.statusCode === 'SUCCESS') {
                    console.log('✅ Game Center 점수 제출 완료:', score);
                    return true;
                } else {
                    console.error('❌ Game Center 점수 제출 실패:', result);
                    console.error('실패 상세:', JSON.stringify(result));
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
            console.error('에러 상세:', error.message, error.stack);
            return false;
        }
    }

    // Toss Game Center 리더보드 열기
    async openGameCenterLeaderboard() {
        try {
            console.log('🏆 Game Center 리더보드 열기 시도');

            // Toss SDK가 로드되어 있는지 확인 (window 명시적 참조)
            const openFunc = window.openGameCenterLeaderboard;
            if (typeof openFunc === 'function') {
                console.log('✓ openGameCenterLeaderboard 함수 발견');

                // openGameCenterLeaderboard()는 Promise<void> 반환
                // undefined 반환 = 버전 미지원 (v5.221.0 미만)
                // 아무것도 반환 안 하면 = 성공 (리더보드 열림)
                const result = await openFunc();

                if (result === undefined && typeof openFunc !== 'undefined') {
                    console.warn('⚠️ Toss 앱 버전 미지원 (v5.221.0 이상 필요)');
                    return { success: false, reason: 'version' };
                }

                console.log('✅ Game Center 리더보드 열림');
                return { success: true };
            } else {
                // Toss SDK가 없는 경우 (로컬 테스트용)
                console.warn('⚠️ Toss SDK 없음 - 테스트 모드');
                console.log('typeof window.openGameCenterLeaderboard:', typeof window.openGameCenterLeaderboard);
                console.log('전역 window 확인:', Object.keys(window).filter(k => k.includes('Game') || k.includes('game')));
                return { success: false, reason: 'no_sdk' };
            }
        } catch (error) {
            console.error('❌ Game Center 리더보드 열기 에러:', error);
            console.error('에러 상세:', error.message, error.stack);
            return { success: false, reason: 'error', error };
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
    async loadRewardedAd(adGroupId) {
        console.log('📥 loadRewardedAd 호출됨, adGroupId:', adGroupId);

        // 환경 확인
        const env = window.getOperationalEnvironment ? window.getOperationalEnvironment() : 'unknown';
        console.log('  - 실행 환경:', env);

        // GoogleAdMob 객체 확인 (Toss WebView에서 주입됨)
        const GoogleAdMob = window.GoogleAdMob;
        if (typeof GoogleAdMob === 'undefined' || !GoogleAdMob.loadAppsInTossAdMob) {
            console.warn('⚠️ GoogleAdMob SDK not loaded (테스트 모드)');
            this.isAdReady = true; // 테스트를 위해 true로 설정
            return false;
        }

        const loadAdFunc = GoogleAdMob.loadAppsInTossAdMob;

        // isSupported() 체크 (공식 문서 권장)
        console.log('  - GoogleAdMob 존재:', typeof GoogleAdMob !== 'undefined');
        console.log('  - loadAppsInTossAdMob 존재:', typeof loadAdFunc === 'function');
        console.log('  - isSupported 함수 존재:', typeof loadAdFunc.isSupported === 'function');

        if (typeof loadAdFunc.isSupported === 'function') {
            const supported = loadAdFunc.isSupported();
            console.log('  - isSupported() 반환값:', supported);

            if (!supported) {
                console.error('❌ 광고 로드 불가: 현재 환경에서 AdMob을 지원하지 않습니다');
                console.error('💡 현재 환경:', env);

                if (env === 'sandbox') {
                    console.warn('⚠️ 샌드박스 환경입니다. 보상형 광고는 샌드박스에서 테스트할 수 없습니다.');
                    console.warn('→ 프로덕션 환경(실제 Toss 앱)에 배포해야 합니다.');
                    // 샌드박스에서는 테스트 모드로 동작
                    this.isAdReady = true;
                    return false;
                }

                console.error('  □ Toss 앱 버전이 낮을 수 있습니다 (SDK 1.0.3 이상 필요)');
                return false;
            }
        }

        try {
            // 실제 광고 ID 사용 (파라미터로 전달받음)
            this.adGroupId = adGroupId;

            // 공식 문서 구조: options에 adGroupId 전달
            await loadAdFunc({
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
    async showRewardedAd(adGroupId, onRewardEarned) {
        console.log('🎬 showRewardedAd 호출됨, adGroupId:', adGroupId);
        console.log('📊 디버깅 정보:');

        // GoogleAdMob 객체 확인 (Toss WebView에서 주입됨)
        const GoogleAdMob = window.GoogleAdMob;
        console.log('  - GoogleAdMob 존재:', typeof GoogleAdMob !== 'undefined');
        console.log('  - isAdReady:', this.isAdReady);

        // Toss AdMob SDK가 없으면 바로 보상 지급 (로컬 테스트용)
        if (typeof GoogleAdMob === 'undefined' || !GoogleAdMob.showAppsInTossAdMob) {
            console.warn('⚠️ GoogleAdMob SDK not loaded - 테스트 모드로 보상 지급');
            if (onRewardEarned) {
                setTimeout(() => onRewardEarned({ unitType: 'test', unitAmount: 1 }), 100);
            }
            return true;
        }

        const showAdFunc = GoogleAdMob.showAppsInTossAdMob;
        console.log('  - showAppsInTossAdMob 존재:', typeof showAdFunc === 'function');

        // isSupported() 체크 (공식 문서 권장)
        console.log('  - isSupported 함수 존재:', typeof showAdFunc.isSupported === 'function');
        if (typeof showAdFunc.isSupported === 'function') {
            const supported = showAdFunc.isSupported();
            console.log('  - isSupported() 반환값:', supported);

            if (!supported) {
                console.error('❌ 현재 환경에서 AdMob을 지원하지 않습니다');
                console.error('💡 가능한 원인:');
                console.error('  1. 샌드박스 환경 (프로덕션 모드로 전환 필요)');
                console.error('  2. 토스 앱 버전이 낮음 (SDK 1.0.3 이상 필요)');
                console.error('  3. iOS 앱 추적 모드 활성화됨 (설정에서 해제 필요)');
                console.error('  4. WebView 환경이 아님 (토스 앱에서만 지원)');
                if (window.showTossModal) {
                    window.showTossModal({
                        title: '광고를 사용할 수 없습니다',
                        message: 'Toss 앱에서만 광고를 볼 수 있습니다.\n\n앱 버전이 낮거나 샌드박스 환경일 수 있습니다.',
                        buttons: [{text: '확인', color: 'secondary'}]
                    });
                }
                return false;
            }
        }

        // 광고 로드 먼저 실행
        await this.loadRewardedAd(adGroupId);

        if (!this.isAdReady) {
            console.warn('❌ 광고가 아직 준비되지 않았습니다');
            if (window.showTossModal) {
                window.showTossModal({
                    title: '광고 로딩 중',
                    message: '광고를 불러오는 중입니다.\n잠시 후 다시 시도해주세요.',
                    buttons: [{text: '확인', color: 'primary'}]
                });
            }
            return false;
        }

        if (!this.adGroupId) {
            console.error('❌ 광고 그룹 ID가 없습니다');
            return false;
        }

        try {
            // 공식 문서 구조: options에 adGroupId 전달
            await showAdFunc({
                options: {
                    adGroupId: this.adGroupId
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
                            // 다음 광고는 showRewardedAd 호출 시 자동으로 로드됨
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
                            if (window.showTossModal) {
                                window.showTossModal({
                                    title: '광고 표시 실패',
                                    message: '광고를 표시할 수 없습니다.\n다시 시도해주세요.',
                                    buttons: [{text: '확인', color: 'secondary'}]
                                });
                            }
                            break;
                    }
                },
                onError: (error) => {
                    console.error('❌ 광고 표시 에러:', error);
                    // 에러 발생 시에도 BGM 재개 (안전장치)
                    if (typeof window.resumeAllAudio === 'function') {
                        window.resumeAllAudio();
                    }
                    if (window.showTossModal) {
                        window.showTossModal({
                            title: '광고 표시 오류',
                            message: '광고를 표시할 수 없습니다.\n다시 시도해주세요.',
                            buttons: [{text: '확인', color: 'secondary'}]
                        });
                    }
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

// window에 노출하여 index.html에서 접근 가능하게
window.tossIntegration = tossIntegration;

// Toss SDK 로드 대기 함수
function waitForTossSDK(timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const checkSDK = () => {
            // 주요 SDK 함수들이 로드되었는지 확인 (window 명시적 참조)
            const sdkReady = (
                typeof window.getUserKeyForGame !== 'undefined' ||
                typeof window.submitGameCenterLeaderBoardScore !== 'undefined' ||
                typeof window.openGameCenterLeaderboard !== 'undefined' ||
                (typeof window.GoogleAdMob !== 'undefined' && window.GoogleAdMob.loadAppsInTossAdMob) ||
                typeof window.contactsViral !== 'undefined'
            );

            if (sdkReady) {
                console.log('✅ Toss SDK 로드 완료');
                console.log('로드된 SDK 함수:');
                console.log('  - getUserKeyForGame:', typeof window.getUserKeyForGame !== 'undefined');
                console.log('  - submitGameCenterLeaderBoardScore:', typeof window.submitGameCenterLeaderBoardScore !== 'undefined');
                console.log('  - openGameCenterLeaderboard:', typeof window.openGameCenterLeaderboard !== 'undefined');
                console.log('  - GoogleAdMob:', typeof window.GoogleAdMob !== 'undefined');
                if (typeof window.GoogleAdMob !== 'undefined') {
                    console.log('    - loadAppsInTossAdMob:', typeof window.GoogleAdMob.loadAppsInTossAdMob === 'function');
                    console.log('    - showAppsInTossAdMob:', typeof window.GoogleAdMob.showAppsInTossAdMob === 'function');
                }
                console.log('  - contactsViral:', typeof window.contactsViral !== 'undefined');
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                console.warn('⚠️ Toss SDK 로드 타임아웃 (로컬 테스트 모드)');
                resolve(false);
            } else {
                setTimeout(checkSDK, 100);
            }
        };
        checkSDK();
    });
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Toss Integration 초기화 시작');
    console.log('=== 환경 체크 ===');

    // 환경 정보
    const env = window.getOperationalEnvironment ? window.getOperationalEnvironment() : 'undefined';
    const tossVersion = window.getTossAppVersion ? window.getTossAppVersion() : 'undefined';
    const platform = window.getPlatformOS ? window.getPlatformOS() : 'undefined';

    console.log('🌍 실행 환경:', env);
    console.log('📱 Toss 앱 버전:', tossVersion);
    console.log('💻 플랫폼:', platform);

    console.log('\n=== SDK 함수 체크 ===');
    console.log('window.GoogleAdMob:', typeof window.GoogleAdMob);
    console.log('window.submitGameCenterLeaderBoardScore:', typeof window.submitGameCenterLeaderBoardScore);
    console.log('window.openGameCenterLeaderboard:', typeof window.openGameCenterLeaderboard);
    console.log('window.contactsViral:', typeof window.contactsViral);

    if (window.GoogleAdMob) {
        console.log('\n=== GoogleAdMob 상세 ===');
        console.log('GoogleAdMob.loadAppsInTossAdMob:', typeof window.GoogleAdMob.loadAppsInTossAdMob);
        console.log('GoogleAdMob.showAppsInTossAdMob:', typeof window.GoogleAdMob.showAppsInTossAdMob);

        if (typeof window.GoogleAdMob.loadAppsInTossAdMob?.isSupported === 'function') {
            const adSupported = window.GoogleAdMob.loadAppsInTossAdMob.isSupported();
            console.log('loadAppsInTossAdMob.isSupported():', adSupported);

            if (!adSupported) {
                console.error('⚠️ 광고 지원 안 됨!');
                console.error('→ 환경:', env);
                console.error('→ Toss 버전:', tossVersion);
                console.error('→ 필요 버전: 5.221.0 이상');
            }
        }
    }

    if (window.openGameCenterLeaderboard) {
        console.log('\n=== 리더보드 체크 ===');
        if (typeof window.openGameCenterLeaderboard.isSupported === 'function') {
            console.log('openGameCenterLeaderboard.isSupported():', window.openGameCenterLeaderboard.isSupported());
        }
    }

    if (window.submitGameCenterLeaderBoardScore) {
        console.log('\n=== 점수 제출 체크 ===');
        if (typeof window.submitGameCenterLeaderBoardScore.isSupported === 'function') {
            console.log('submitGameCenterLeaderBoardScore.isSupported():', window.submitGameCenterLeaderBoardScore.isSupported());
        }
    }

    // SDK 로드 대기 (최대 5초)
    await waitForTossSDK();

    const isAuthenticated = await tossIntegration.initialize();

    // SDK 가용성 최종 확인
    console.log('\n=== 기능 가용성 최종 체크 ===');
    const availability = {
        leaderboard: tossIntegration.isLeaderboardAvailable(),
        ad: tossIntegration.isAdAvailable(),
        invite: tossIntegration.isInviteFriendsAvailable()
    };
    console.log('📊 리더보드:', availability.leaderboard ? '✅ 사용 가능' : '❌ 사용 불가');
    console.log('📺 광고:', availability.ad ? '✅ 사용 가능' : '❌ 사용 불가');
    console.log('👥 친구 초대:', availability.invite ? '✅ 사용 가능' : '❌ 사용 불가');

    if (!availability.leaderboard && !availability.ad && !availability.invite) {
        console.error('⚠️ 모든 SDK 기능을 사용할 수 없습니다!');
        console.error('→ Toss 앱에서 실행하고 있는지 확인해주세요.');
        console.error('→ 현재 환경:', env);
        console.error('→ Toss 버전:', tossVersion);
    }

    if (isAuthenticated) {
        console.log('✅ Toss Apps-in-Toss 연동 완료');

        // 에너지 충전용 광고 미리 로드
        await tossIntegration.loadRewardedAd('ait.live.93f320e4e9504159');

        // UI에 사용자 정보 표시 (선택사항)
        if (tossIntegration.userInfo) {
            document.body.setAttribute('data-toss-user', 'authenticated');
        }
    } else {
        console.log('ℹ️ Toss 인증 없음 (일반 모드)');
        // 로컬 테스트를 위해 광고도 로드
        await tossIntegration.loadRewardedAd('ait.live.93f320e4e9504159');
    }

    // 게임 에너지 시스템 초기화 (userKey 설정 완료 후)
    if (typeof window.initializeHeartSystem === 'function') {
        await window.initializeHeartSystem();
    }
});
