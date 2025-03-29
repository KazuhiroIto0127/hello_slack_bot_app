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

const { say_command } = require('./say_command'); // Import the command function
const { createTaskModal } = require('./modals/task_modal'); // Import the external modal function
const { postTaskMessage } = require('./utils/task_utils'); // Import the external function

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

// app_mentionイベントをリッスン（ボットがメンションされた時に発火）
app.event('app_mention', async ({ event, say }) => {
  console.log('メンションを受け取りました:', event);

  try {
    if (event.text.includes('god')) {
      await say({
        text: 'あなたは神です！',
        thread_ts: event.ts
      });
      return;
    } else if (event.text.includes('command')) {
      await say_command(event, say); // Use the imported command function
      return;
    } else {
      await say({
        text: `こんにちは <@${event.user}>さん！何かお手伝いできることはありますか？`,
      });
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
});

// ボタンアクションのリスナーを追加
app.action('help_button', async ({ ack, body, say }) => {
  // アクションを受け取ったことを確認
  await ack();

  // ヘルプメッセージを送信
  await say({
    text: `<@${body.user.id}>さん、以下のコマンドが利用できます：\n• @bot_name + メッセージ：チャットを開始\n• タスク登録：新しいタスクを登録\n• その他の機能は開発中です！`,
    thread_ts: body.message.ts // 元のメッセージのスレッドに返信
  });
});

app.action('cancel_button', async ({ ack, body, say }) => {
  await ack();
  await say({
    text: `<@${body.user.id}>さん、キャンセルしました。また何かあればお声がけください。`,
    thread_ts: body.message.ts
  });
});

app.action('task_button', async ({ ack, body, client }) => {
  await ack();

  // モーダルを開く
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: createTaskModal() // Use the external function to get the modal structure
    });
  } catch (error) {
    console.error('モーダル表示エラー:', error);
  }
});

// モーダル送信処理
app.view('task_modal', async ({ ack, body, view, client }) => {
  await ack();

  // フォームの値を取得
  const taskName = view.state.values.task_name_block.task_name.value;
  const taskDescription = view.state.values.task_description_block.task_description.value;
  const taskDue = view.state.values.task_due_block.task_due.selected_date;

  // チャンネルにタスク情報を投稿
  try {
    const channelId = body.user.id; // DMでユーザーに送信する場合
    await postTaskMessage(client, channelId, taskName, taskDescription, taskDue); // Use the external function
  } catch (error) {
    console.error('タスク登録エラー:', error);
  }
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
