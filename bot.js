import telegram from 'node-telegram-bot-api';
import { gql } from 'graphql-request';
import moment from 'moment';
import dotenv from 'dotenv';
import { graphQLClient } from './graphQLClient.js';
import Aws from 'aws-sdk';
import {
  commitMsg,
  getRandomCommitMsg,
  helpMsg,
  userRegisterMsg,
} from './message.js';

dotenv.config();

// AWS 환경설정
Aws.config.update({
  region: 'ap-northeast-2',
  endpoint: 'https://dynamodb.ap-northeast-2.amazonaws.com',
  accessKeyId: `${process.env.AWS_ACCESS_ID}`,
  secretAccessKey: `${process.env.AWS_SECRET_KEY}`,
});

// dynamoDB client 인스턴스 생성
const docClient = new Aws.DynamoDB.DocumentClient();

// bot 인스턴스 생성
const bot = new telegram(`${process.env.BOT_TOKEN}`, {
  polling: true,
});

// start command 설정
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, helpMsg);
});

// help command 설정
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, helpMsg);
});

// user command 설정
// username을 message로 받아 dynamoDB에 저장
bot.onText(/\/user (.+)/, (msg, match) => {
  // 파라미터 설정
  const params = {
    TableName: 'daily-commit-bot',
    Item: {
      chatId: msg.chat.id,
      username: match[1],
    },
  };

  // {chatId, username} 형식으로 DB에 저장
  docClient.put(params, (err) => {
    if (err) {
      console.log(err);
    } else {
      bot.sendMessage(msg.chat.id, userRegisterMsg);
    }
  });
});

const today = moment();
const from = today.startOf('day').format();
const to = today.endOf('day').format();

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
        bot.sendMessage(chatId, getRandomCommitMsg(commitMsg));
      }
    });
  }
});
