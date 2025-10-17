const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

// CORS 설정
app.use(express.json());
app.use(express.static('.'));

// 정적 파일 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Toss mTLS 인증서 로드
const tossClientCert = fs.readFileSync(path.join(__dirname, 'certs', 'young_public.crt'));
const tossClientKey = fs.readFileSync(path.join(__dirname, 'certs', 'young_private.key'));

// Toss Apps-in-Toss API 호출을 위한 설정
const tossAxiosInstance = axios.create({
    httpsAgent: new https.Agent({
        cert: tossClientCert,
        key: tossClientKey,
        rejectUnauthorized: true
    }),
    headers: {
        'Content-Type': 'application/json'
    }
});

// API 엔드포인트: 사용자 정보 조회
app.get('/api/toss/user', async (req, res) => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ error: 'Authorization header required' });
        }

        // Toss API 호출 (실제 엔드포인트는 Toss 문서 참조)
        const response = await tossAxiosInstance.get('https://api.toss.im/v1/user', {
            headers: {
                'Authorization': authorization
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Toss API error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch user data',
            details: error.response?.data || error.message
        });
    }
});

// API 엔드포인트: 게임 점수 저장
app.post('/api/toss/save-score', async (req, res) => {
    try {
        const { authorization } = req.headers;
        const { score, kills, time, mode, stage } = req.body;

        if (!authorization) {
            return res.status(401).json({ error: 'Authorization header required' });
        }

        // 여기에 실제 점수 저장 로직 구현
        // 예: 데이터베이스 저장 또는 Toss API 호출

        res.json({
            success: true,
            message: 'Score saved successfully',
            data: { score, kills, time, mode, stage }
        });
    } catch (error) {
        console.error('Save score error:', error.message);
        res.status(500).json({
            error: 'Failed to save score',
            details: error.message
        });
    }
});

// API 엔드포인트: 리더보드 조회
app.get('/api/toss/leaderboard', async (req, res) => {
    try {
        const { mode, stage } = req.query;

        // 여기에 실제 리더보드 조회 로직 구현
        // 예: 데이터베이스에서 상위 점수 조회

        // 임시 더미 데이터
        res.json({
            leaderboard: [
                { rank: 1, username: 'Player1', score: 10000, kills: 500, time: 600000 },
                { rank: 2, username: 'Player2', score: 8500, kills: 420, time: 540000 },
                { rank: 3, username: 'Player3', score: 7200, kills: 380, time: 480000 }
            ]
        });
    } catch (error) {
        console.error('Leaderboard error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch leaderboard',
            details: error.message
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     DRONE WAR Server Running          ║
╚═══════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
🎮 Game: http://localhost:${PORT}/
🔐 Toss mTLS: Configured
📜 Certificates: ./certs/

Ready to play!
    `);
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
