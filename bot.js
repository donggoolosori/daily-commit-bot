import telegram from 'node-telegram-bot-api';
import cron from 'node-cron';
import { gql, GraphQLClient } from 'graphql-request';
import moment from 'moment';

const bot = new telegram('1769867744:AAEqitqeJLy897CqSW_NH9eIl2wmW1yvFmY', {
  polling: true,
});
const endpoint = 'https://api.github.com/graphql';

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: 'Token 8dc3ae6cf7244d5a36aeacb87da8f0c713c36f43',
  },
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

  bot.sendMessage(1740567815, totalContributions);
});
