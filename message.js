'use strict';

const greetMsg = (name) => {
  return `
  안녕하세요 ${name}님!
  아래의 명령어를 통해 깃허브 username을 등록하세요!
  등록하신 github 계정의 commit을 확인하여, 
  오늘 하루 commit이 없다면 주기적으로 알람을 보냅니다.
  daily commit 봇과 함께 1일 1커밋을 실천해보세요~ :)
  ${helpMsg}
  `;
};

const userRegisterMsg = (username) => {
  return `
  "${username}" (으)로 github username 등록 완료! 🎉
이제 등록된 github username의 커밋을 확인하여 알람을 보내드립니다. 
알맞게 등록했는지 다시 한번 확인해주세요~ :)
`;
};
const helpMsg = `
/help - 도움말 
/user <your-github-username> - github username을 등록합니다. 등록된 username의 커밋을 확인하여 알람을 보내오니, 정확한 username을 입력해주세요!
ex) /user donggoolosori

알람주기 : 저녁 8시, 9시, 10시, 11시
`;

const errorMsg = `잘 이해하지 못했어요 ㅠㅠ
/help 를 통해 도움말을 확인해보세요!
`;

const getRandomCommitMsg = () => {
  const commitMsg = [
    '커밋하세요!',
    '커밋 커밋 커밋!',
    '당신의 잔디밭이 시들고 있습니다..',
  ];
  const len = commitMsg.length;
  const randNum = Math.floor(Math.random() * len);
  return commitMsg[randNum];
};

exports.greetMsg = greetMsg;
exports.userRegisterMsg = userRegisterMsg;
exports.helpMsg = helpMsg;
exports.errorMsg = errorMsg;
exports.getRandomCommitMsg = getRandomCommitMsg;
