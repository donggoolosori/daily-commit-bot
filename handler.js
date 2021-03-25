'use strict';

const telegram = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const Aws = require('aws-sdk');
const moment = require('moment');
const { gql } = require('graphql-request');
const msgPack = require('./message');
const graphQLClient = require('./graphQLClient');

// dotenv 설정
dotenv.config();

// bot 인스턴스 생성
const bot = new telegram(`${process.env.BOT_TOKEN}`);

// AWS 환경설정
Aws.config.update({
  region: 'ap-northeast-2',
  endpoint: 'https://dynamodb.ap-northeast-2.amazonaws.com',
  accessKeyId: `${process.env.AWS_ACCESS_ID}`,
  secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
});

// dynamoDB client 인스턴스 생성
const docClient = new Aws.DynamoDB.DocumentClient();

const sendMessage = async () => {
  // 오늘 날짜 설정
  const today = moment();
  const from = today.startOf('day').format();
  const to = today.endOf('day').format();

  // 가져올 table이름 설정
  const params = {
    TableName: 'daily-commit-bot',
  };

  // db의 모든 user 정보 가져오기
  docClient.scan(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      // db의 모든 user 정보
      const users = data.Items;

      // user마다 알림보내기(contribution이 0일 경우만)
      users.forEach(async (user) => {
        const chatId = user.chatId;
        const username = user.username;

        // graphQL 쿼리 생성
        const query = gql`
          query($user: String!, $from: DateTime, $to: DateTime) {
            user(login: $user) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                }
              }
            }
          }
        `;

        // graphQL 변수 설정
        const variables = {
          user: username,
          from: from,
          to: to,
        };
        // user의 contribution 갯수 받기
        const {
          user: {
            contributionsCollection: {
              contributionCalendar: { totalContributions },
            },
          },
        } = await graphQLClient.request(query, variables);

        console.log(totalContributions);
        // 오늘 contribution이 없다면 알람을 보낸다.
        if (totalContributions == 0) {
          bot.sendMessage(chatId, msgPack.getRandomCommitMsg());
        }
      });
    }
  });
};

module.exports.hello = async (event) => {
  // user의 message 요청이 아닐 경우 (cron 실행)
  if (!event.body) {
    await sendMessage();
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
