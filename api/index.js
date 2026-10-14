const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);

// 簡單的記憶體紀錄點擊次數
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

  if (event.message.text === '點擊累加') {
    const userId = event.source.userId;
    let count = userClicks.get(userId) || 0;
    count += 1;
    userClicks.set(userId, count);

    let replyText = '';
    if (count === 1) {
      replyText = '這是第 1 次點擊的回覆！';
    } else if (count === 2) {
      replyText = '這是第 2 次點擊的回覆！';
    } else {
      replyText = `這是第 ${count} 次點擊的回覆！`;
    }

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });
  }

  return Promise.resolve(null);
}