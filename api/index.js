const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// 記憶體紀錄點擊次數 (注意：Vercel Serverless 重新冷啟動時次數會重置)
const userClicks = new Map();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // 假設圖文選單按鈕發送的文字是 "點擊累加"
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

module.exports = app;