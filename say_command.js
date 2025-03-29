async function say_command(event, say) {
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `こんにちは <@${event.user}>さん！何かお手伝いできることはありますか？`
        }
      },
      {
        type: "actions",
        block_id: "interactive_buttons",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "ヘルプ",
              emoji: true
            },
            action_id: "help_button",
            style: "primary"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "タスク登録",
              emoji: true
            },
            action_id: "task_button"
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "キャンセル",
              emoji: true
            },
            action_id: "cancel_button",
            style: "danger"
          }
        ]
      }
    ],
    text: `こんにちは <@${event.user}>さん！何かお手伝いできることはありますか？`
  });
}

module.exports = { say_command };
