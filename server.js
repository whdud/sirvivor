const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// CORS 및 정적 파일 설정
app.use(express.json());
app.use(express.static('.'));

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════╗
║     DRONE WAR Server Running          ║
╚═══════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
🎮 Game: http://localhost:${PORT}/
📱 Mobile: http://YOUR_IP:${PORT}/
🏆 Toss Game Center: Integrated

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
