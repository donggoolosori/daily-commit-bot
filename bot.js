import telegram from 'node-telegram-bot-api';
import cron from 'node-cron';
import { gql } from 'graphql-request';
import moment from 'moment';
import dotenv from 'dotenv';
import { graphQLClient } from './graphQLClient.js';

dotenv.config();

let userDB = [];

const bot = new telegram(`${process.env.BOT_TOKEN}`, {
  polling: true,
});

const userRegisterMsg = `
Your github username is successfully registered! 🎉
From now on, you can get an alarm of github contributions.
`;

bot.onText(/\/user (.+)/, (msg, match) => {
  bot.sendMessage(1740567815, userRegisterMsg);
  const newData = {
    id: msg.chat.id,
    username: match[1],
  };
  userDB.push(newData);
  console.log(userDB);
});

cron.schedule('* * * * *', async () => {
  const today = moment();
  const from = today.startOf('day').format();
  const to = today.endOf('day').format();

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

  const variables = {
    user: 'donggoolosori',
    from: from,
    to: to,
  };

  const {
    user: {
      contributionsCollection: {
        contributionCalendar: { totalContributions },
      },
    },
  } = await graphQLClient.request(query, variables);

  console.log(totalContributions);

  // bot.sendMessage(1740567815, totalContributions);
});
