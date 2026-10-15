module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>❤️ 婚禮祝福留言牆 ❤️</title>
    <style>
        body {
            background: linear-gradient(135deg, #fce4ec 0%, #f8f4bb 100%);
            font-family: 'Microsoft JhengHei', sans-serif;
            margin: 0;
            padding: 40px;
            text-align: center;
            min-height: 100vh;
            box-sizing: border-box;
        }
        h1 {
            color: #ad1457;
            font-size: 52px;
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            letter-spacing: 2px;
        }
        #wall {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 25px;
            max-width: 1400px;
            margin: 0 auto;
            padding: 10px;
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(216, 27, 96, 0.15);
            text-align: left;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-top: 5px solid #1e88e5; /* 質感藍色頂部裝飾 */
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(216, 27, 96, 0.25);
        }
        .card .name {
            font-weight: bold;
            color: #1e88e5; /* 改成漂亮的質感藍色 */
            font-size: 22px;
            margin-bottom: 12px;
            border-bottom: 2px solid #e3f2fd;
            padding-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card .name::before {
            content: '💌';
            font-size: 18px;
        }
        .card .message {
            color: #333333;
            font-size: 20px;
            line-height: 1.5;
            word-break: break-all;
            margin-bottom: 15px;
            flex-grow: 1;
        }
        .card .time {
            color: #888888;
            font-size: 13px;
            text-align: right;
            border-top: 1px dashed #eee;
            padding-top: 10px;
        }
        .loading {
            grid-column: 1 / -1;
            font-size: 24px;
            color: #ad1457;
            padding: 60px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>

    <h1>💍 佑佑班祝福牆 💍</h1>
    <div id="wall">
        <div class="loading">💖 正在載入大家的祝福，請稍候... 💖</div>
    </div>

    <script>
        const API_URL = 'https://script.google.com/macros/s/AKfycby8vSo754ML70CP383nQ4rGJW7Tpod-f1ZOgnu09Y-ogE7erfY422XPIOwruLa4t-a-mQ/exec';

        async function fetchMessages() {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                
                const wallDiv = document.getElementById('wall');
                
                if (data.length === 0) {
                    wallDiv.innerHTML = '<div class="loading">目前還沒有人留言，趕快用 LINE 發送「＃你的祝福內容」吧！</div>';
                    return;
                }

                // 避免每次重新整理時 DOM 全部重繪閃爍，只有當資料有變動時才更新
                const currentCardsCount = wallDiv.querySelectorAll('.card').length;
                if (currentCardsCount === data.length) return; // 數量沒變就不重複渲染

                wallDiv.innerHTML = '';

                data.reverse().forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'card';

                    const timeStr = new Date(item.time).toLocaleString('zh-TW', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    });

                    card.innerHTML = \`
                        <div>
                            <div class="name">\${escapeHtml(item.name)}</div>
                            <div class="message">\${escapeHtml(item.message)}</div>
                        </div>
                        <div class="time">\${timeStr}</div>
                    \`;
                    wallDiv.appendChild(card);
                });
            } catch (error) {
                console.error('取得留言失敗', error);
            }
        }

        function escapeHtml(text) {
            if (!text) return '';
            return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        fetchMessages();
        setInterval(fetchMessages, 5000);
    </script>
</body>
</html>
  `);
};
