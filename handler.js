'use strict';

const telegram = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const msg = require('./message');
const graphQLClient = require('./graphQLClient');

dotenv.config();

module.exports.hello = async (event) => {
  // bot 인스턴스 생성
  const bot = new telegram(`${process.env.BOT_TOKEN}`);

  // user의 message 요청이 아닐 경우 (cron 실행)
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Bad Request',
        input: event,
      }),
    };
  }
  const message = JSON.parse(event.body).message;
  const chatId = message.chat.id;
  const text = message.text;

  console.log(chatId, text);

  await bot.sendMessage(1740567815, 'test test');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Success',
      input: event,
    }),
  };
};
