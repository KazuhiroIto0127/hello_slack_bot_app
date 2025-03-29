/**
 * Post a task message to a Slack channel.
 * @param {Object} client - Slack client instance.
 * @param {string} channelId - Channel ID to post the message.
 * @param {string} taskName - Name of the task.
 * @param {string} taskDescription - Description of the task.
 * @param {string} taskDue - Due date of the task.
 */
async function postTaskMessage(client, channelId, taskName, taskDescription, taskDue) {
  await client.chat.postMessage({
    channel: channelId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*新しいタスクが登録されました*"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*タスク名:*\n${taskName}`
          },
          {
            type: "mrkdwn",
            text: `*期限日:*\n${taskDue}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*詳細:*\n${taskDescription}`
        }
      }
    ]
  });
}

module.exports = { postTaskMessage };
