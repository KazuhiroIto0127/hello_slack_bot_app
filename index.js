// Slack Bot アプリケーション
const { App, AwsLambdaReceiver, LogLevel } = require('@slack/bolt'); // LogLevel を追加

// AWS Lambda用のレシーバーを初期化
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG, // デバッグログを有効化
  processBeforeResponse: true // API Gatewayに応答する前にリクエストを処理
});


// Slack Boltアプリの初期化
console.log('Slack Boltアプリを初期化しています...');
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  // デバッグ用に詳細なログを有効化
  logLevel: 'debug',
  // スラッシュコマンドに応答するためのシークレット
  // signingSecret: process.env.SLACK_SIGNING_SECRET
});

const { say_command } = require('./say_command'); // Import the command function
const { createTaskModal } = require('./modals/task_modal'); // Import the external modal function
const { postTaskMessage } = require('./utils/task_utils'); // Import the external function

// /hello コマンドに応答
app.command('/hello', async ({ command, ack, say, logger }) => {
  // コマンドの受信を確認
  await ack();

  logger.info('helloコマンド受信:', command);

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

// Lambda関数のハンドラー
module.exports.handler = async (event, context, callback) => {
  // console.log('Lambdaイベント受信:', JSON.stringify(event)); // 必要に応じてデバッグログ

  // AwsLambdaReceiverにイベント処理を委譲
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);

  // try-catch は AwsLambdaReceiver が内部で行うため、通常は不要
  // どうしてもハンドラーレベルでキャッチしたい例外がある場合のみ追加
};
