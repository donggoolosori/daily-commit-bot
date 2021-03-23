import telegram from 'node-telegram-bot-api';
import cron from 'node-cron';
import { gql } from 'graphql-request';
import moment from 'moment';
import dotenv from 'dotenv';
import { graphQLClient } from './graphQLClient.js';

dotenv.config();

const bot = new telegram(`${process.env.BOT_TOKEN}`, {
  polling: true,
});

cron.schedule('*/10 * * * * *', async () => {
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
