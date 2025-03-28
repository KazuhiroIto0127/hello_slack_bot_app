// Slack Bot アプリケーション
const { App } = require('@slack/bolt');

// 環境変数から認証情報を取得
require('dotenv').config();

// Bolt アプリの初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // ソケットモードを有効化
  appToken: process.env.SLACK_APP_TOKEN // ソケットモード用のアプリレベルトークン
});

// /hello コマンドに応答
app.command('/hello', async ({ command, ack, say }) => {
  // コマンドの受信を確認
  await ack();

  // 「hello」メッセージを送信
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `こんにちは、<@${command.user_id}>さん！`
        }
      }
    ],
    text: `こんにちは、<@${command.user_id}>さん！`
  });
});

// エラーハンドリング
app.error((error) => {
  console.error('エラーが発生しました:', error);
});

// アプリの起動
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt アプリが起動しました');
})();
