const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

// 記憶體紀錄點擊次數
const userClicks = new Map();

// 您的 Google Apps Script 網頁應用程式網址
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8vSo754ML70CP383nQ4rGJW7Tpod-f1ZOgnu09Y-ogE7erfY422XPIOwruLa4t-a-mQ/exec';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(200).send('LINE Bot Server is running!');
    return;
  }

  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;
  const userId = event.source.userId;

  // 1. 處理祝福留言功能（支援半形 # 或全形 ＃）
  if (userMessage.startsWith('#') || userMessage.startsWith('＃')) {
    // 把開頭的 # 或 ＃ 濾掉，取得後面的內容
    const wishContent = userMessage.replace(/^[#＃]/, '').trim();
    
    // 取得使用者 LINE 顯示名稱
    let displayName = '匿名家人';
    try {
      const profile = await client.getProfile(userId);
      displayName = profile.displayName;
    } catch (e) {
      console.error('無法取得使用者名稱', e);
    }

    // 將資料送到 Google 試算表
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: displayName,
          message: wishContent
        })
      });
    } catch (e) {
      console.error('寫入 Google 試算表失敗', e);
    }

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `感謝 ${displayName} 的祝福！已成功送到大螢幕囉！🎉`
    });
  }

  // 2. 原有的圖文選單點擊計數功能
  if (userMessage === '我戳~~') {
    let count = userClicks.get(userId) || 0;
    count += 1;
    userClicks.set(userId, count);

    let replyText = '不要戳我~~';
    if (count <= 2) {
      replyText = '不要戳我~~';
    } else if (count === 3) {
      replyText = '都說不要戳我了| ￣へ￣ |';
    } else if (count === 4) {
      replyText = '拜託不要戳我了';
    } else {
      replyText = '來婚禮再戳本人';
    }

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });
  }

  return Promise.resolve(null);
}
