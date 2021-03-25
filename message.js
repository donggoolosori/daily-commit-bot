'use strict';

const userRegisterMsg = `
github username 등록 완료! 🎉
이제 등록된 github username의 커밋을 확인하여 알람을 받으실 수 있습니다. 
github username을 알맞게 등록했는지 다시 한번 확인해주세요~ :)
`;
const helpMsg = `
/help - 도움말 
/user <your-github-username> - github username을 등록합니다. 등록된 username의 커밋을 확인하여 알람을 보내오니, 정확한 username을 입력해주세요!
`;
const commitMsg = [
  '커밋하세요!',
  '커밋 커밋 커밋!',
  '당신의 잔디밭이 시들고 있습니다..',
];

const getRandomCommitMsg = (commitMsg) => {
  const len = commitMsg.length;
  const randNum = Math.floor(Math.random() * len);
  return commitMsg[randNum];
};

exports.userRegisterMsg = userRegisterMsg;
exports.helpMsg = helpMsg;
exports.commitMsg = commitMsg;
exports.getRandomCommitMsg = getRandomCommitMsg;
