'use strict';
const telegram = require('node-telegram-bot-api');

module.exports.hello = async (event) => {
  const bot = new telegram(`1769867744:AAEqitqeJLy897CqSW_NH9eIl2wmW1yvFmY`);
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
