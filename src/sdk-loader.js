// Toss Apps-in-Toss SDK 로더
// 이 파일은 SDK를 import해서 window 객체에 노출시킵니다

// @apps-in-toss/web-framework에서 모든 SDK 함수 import
import * as TossSDK from '@apps-in-toss/web-framework';

// SDK를 window 객체에 노출
console.log('📦 Toss SDK 로딩 중...');
console.log('SDK 내용:', Object.keys(TossSDK));

// GoogleAdMob을 window에 노출
if (TossSDK.GoogleAdMob) {
    window.GoogleAdMob = TossSDK.GoogleAdMob;
    console.log('✅ GoogleAdMob 로드됨:', window.GoogleAdMob);
} else {
    console.warn('⚠️ GoogleAdMob을 찾을 수 없습니다');
}

// 게임센터 함수들도 window에 노출
if (TossSDK.submitGameCenterLeaderBoardScore) {
    window.submitGameCenterLeaderBoardScore = TossSDK.submitGameCenterLeaderBoardScore;
    console.log('✅ submitGameCenterLeaderBoardScore 로드됨');
}

if (TossSDK.openGameCenterLeaderboard) {
    window.openGameCenterLeaderboard = TossSDK.openGameCenterLeaderboard;
    console.log('✅ openGameCenterLeaderboard 로드됨');
}

// getUserKeyForGame (있다면)
if (TossSDK.getUserKeyForGame) {
    window.getUserKeyForGame = TossSDK.getUserKeyForGame;
    console.log('✅ getUserKeyForGame 로드됨');
}

// Storage API
if (TossSDK.Storage) {
    window.TossStorage = TossSDK.Storage;
    console.log('✅ Storage 로드됨');
}

// contactsViral (친구 초대)
if (TossSDK.contactsViral) {
    window.contactsViral = TossSDK.contactsViral;
    console.log('✅ contactsViral 로드됨');
}

// getOperationalEnvironment (환경 확인)
if (TossSDK.getOperationalEnvironment) {
    window.getOperationalEnvironment = TossSDK.getOperationalEnvironment;
    console.log('✅ getOperationalEnvironment 로드됨');
    console.log('   현재 환경:', TossSDK.getOperationalEnvironment());
}

// getTossAppVersion (앱 버전)
if (TossSDK.getTossAppVersion) {
    window.getTossAppVersion = TossSDK.getTossAppVersion;
    console.log('✅ getTossAppVersion 로드됨');
    console.log('   Toss 버전:', TossSDK.getTossAppVersion());
}

// getPlatformOS (플랫폼)
if (TossSDK.getPlatformOS) {
    window.getPlatformOS = TossSDK.getPlatformOS;
    console.log('✅ getPlatformOS 로드됨');
    console.log('   플랫폼:', TossSDK.getPlatformOS());
}

// isMinVersionSupported (버전 체크 헬퍼)
if (TossSDK.isMinVersionSupported) {
    window.isMinVersionSupported = TossSDK.isMinVersionSupported;
    console.log('✅ isMinVersionSupported 로드됨');
}

console.log('✅ Toss SDK 로드 완료');
