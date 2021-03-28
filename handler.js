'use strict';

const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const moment = require('moment');
const { gql, GraphQLClient } = require('graphql-request');
const msgPack = require('./message');

// dotenv 설정
dotenv.config();

// bot 인스턴스 생성
const bot = new TelegramBot(`${process.env.BOT_TOKEN}`);

// AWS 환경설정
AWS.config.update({
  region: 'ap-northeast-2',
  endpoint: 'https://dynamodb.ap-northeast-2.amazonaws.com',
  accessKeyId: `${process.env.AWS_ACCESS_ID}`,
  secretAccessKey: `${process.env.AWS_ACCESS_SECRET_KEY}`,
});

// dynamoDB client 인스턴스 생성
const docClient = new AWS.DynamoDB.DocumentClient();

// graphql client 설정
const endpoint = 'https://api.github.com/graphql';

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Token ${process.env.GITHUB_TOKEN}`,
  },
});

const getContributions = async (query, variables) => {
  try {
    const {
      user: {
        contributionsCollection: {
          contributionCalendar: { totalContributions },
        },
      },
    } = await graphQLClient.request(query, variables);
    return totalContributions;
  } catch (error) {
    console.log(error);
  }
};

const sendCommitMessage = async () => {
  // 오늘 날짜 설정
  const today = moment.utc().startOf('day');
  const from = today.subtract(9, 'hour').format();
  const to = moment.utc().format();

  // 가져올 table이름 설정
  const params = {
    TableName: 'daily-commit-bot',
  };

  // db의 모든 user 정보 가져오기
  try {
    const data = await docClient.scan(params).promise();
    if (!data) {
      throw 'noData';
    }
    // db의 모든 user 정보
    const users = data.Items;
    // user마다 알림보내기(contribution이 0일 경우만)
    for (let i = 0; i < users.length; i++) {
      const chatId = users[i].chatId;
      const username = users[i].username;

      // graphQL 쿼리 생성
      const query = await gql`
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
      // TODO : graphQLClient.request가 안됨
      // user의 contribution 갯수 받기
      const totalContributions = await getContributions(query, variables);
      console.log(totalContributions);

      // 오늘 contribution이 없다면 알람을 보낸다.
      if (totalContributions === 0) {
        await bot.sendMessage(chatId, msgPack.getRandomCommitMsg());
      }
    }
  } catch (err) {
    if (err === 'noData') {
      console.log('There is no user');
    } else {
      console.log(err);
    }
  }
};

const sendCommandMessage = async (message) => {
  const chatId = message.chat.id;
  const name = message.from.first_name;
  const text = message.text;
  const textSplits = text.split(' ');
  const command = textSplits[0];
  const username = textSplits[1];

  // 명령어 설정
  if (command === '/start') {
    await bot.sendMessage(chatId, msgPack.greetMsg(name));
  } else if (command === '/help') {
    await bot.sendMessage(chatId, msgPack.helpMsg);
  } else if (command === '/user' && username) {
    // 파라미터 설정
    const params = {
      TableName: 'daily-commit-bot',
      Item: {
        chatId: chatId,
        username: username,
      },
    };

    // {chatId, username} 형식으로 DB에 저장
    try {
      await docClient.put(params).promise();
      await bot.sendMessage(chatId, msgPack.userRegisterMsg(username));
    } catch (err) {
      console.log(err);
    }
  } else if (command === '/user') {
    const params = {
      TableName: 'daily-commit-bot',
      Key: {
        chatId: chatId,
      },
    };
    try {
      const data = await docClient.get(params).promise();
      console.log(data);
      if (Object.keys(data).length === 0) {
        await bot.sendMessage(
          chatId,
          '아직 github 계정을 등록하지 않았습니다! username을 등록해주세요.'
        );
      } else {
        const currUser = data.Item.username;
        await bot.sendMessage(
          chatId,
          `현재 등록된 github username은 "${currUser}" 입니다.`
        );
      }
    } catch (error) {
      console.log(error);
    }
  } else if (command === '/test') {
    await sendCommitMessage();
  } else {
    await bot.sendMessage(chatId, msgPack.errorMsg);
  }
};

module.exports.hello = async (event) => {
  // user의 message 요청이 아닐 경우 (cron 실행)
  if (!event.body) {
    await sendCommitMessage();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Commit Check Succeed',
        input: event,
      }),
    };
  }
  const message = JSON.parse(event.body).message;

  await sendCommandMessage(message);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Success',
      input: event,
    }),
  };
};
