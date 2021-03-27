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
    `커밋 할 시간!`,
    `커밋 커밋 커밋!`,
    `잔디밭이 시들고 있어요...`,
  ];
  const newLine = `

  `;
  const wiseSaying = [
    `아직 커밋 할 시간이 있는 한 희망은 있다.
    - 키케로`,
    `커밋 한다는것, 그것은 치열한 전투이다.
    - 로망로랑`,
    `어리석은 자는 멀리서 행복을 찾고, 현명한 자는 1일 1커밋을 하며 행복을 키워간다.
    - 제임스 오펜하임`,
    `진짜 문제는 1일 1커밋이다. 그것은 절대로 물리학이나 윤리학의 문제가 아니다. 
    - 아인슈타인`,
    `당신이 커밋 할수 있다고 믿든 할수 없다고 믿든, 믿는 대로 될것이다.
    - 헨리 포드`,
    `작은 커밋으로부터 종종 위대한 업적이 시작된다.
    - 데모스테네스`,
    `내 비장의 무기는 아직 손안에 있다. 그것은 1일 1커밋이다. 
    – 나폴레옹`,
    `네 자신의 불행을 생각하지 않게 되는 가장 좋은 방법은 커밋하는 것이다. 
    - 베토벤`,
    `최고에 도달하려면 1일 1커밋에서 시작하라. 
    - P.시루스`,
  ];
  const wlen = wiseSaying.length;
  const clen = commitMsg.length;
  const wRandNum = Math.floor(Math.random() * wlen);
  const cRandNum = Math.floor(Math.random() * clen);

  return commitMsg[cRandNum] + newLine + wiseSaying[wRandNum];
};

exports.greetMsg = greetMsg;
exports.userRegisterMsg = userRegisterMsg;
exports.helpMsg = helpMsg;
exports.errorMsg = errorMsg;
exports.getRandomCommitMsg = getRandomCommitMsg;
