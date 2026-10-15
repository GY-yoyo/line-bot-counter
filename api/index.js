const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

// 記憶體紀錄點擊次數
const userClicks = new Map();

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

  // 對應圖文選單發送的文字 "不要戳我~~"
  if (event.message.text === '不要戳我~~') {
    const userId = event.source.userId;
    let count = userClicks.get(userId) || 0;
    count += 1;
    userClicks.set(userId, count);

    let replyText = '';
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