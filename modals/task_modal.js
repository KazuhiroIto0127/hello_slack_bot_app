// Function to create the task modal structure
function createTaskModal() {
  return {
    type: "modal",
    callback_id: "task_modal",
    title: {
      type: "plain_text",
      text: "タスク登録",
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "登録",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "キャンセル",
      emoji: true
    },
    blocks: [
      {
        type: "input",
        block_id: "task_name_block",
        element: {
          type: "plain_text_input",
          action_id: "task_name",
          placeholder: {
            type: "plain_text",
            text: "タスク名を入力"
          }
        },
        label: {
          type: "plain_text",
          text: "タスク名",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "task_description_block",
        element: {
          type: "plain_text_input",
          action_id: "task_description",
          multiline: true,
          placeholder: {
            type: "plain_text",
            text: "タスクの詳細を入力"
          }
        },
        label: {
          type: "plain_text",
          text: "詳細",
          emoji: true
        }
      },
      {
        type: "input",
        block_id: "task_due_block",
        element: {
          type: "datepicker",
          action_id: "task_due",
          placeholder: {
            type: "plain_text",
            text: "期限日を選択",
            emoji: true
          }
        },
        label: {
          type: "plain_text",
          text: "期限日",
          emoji: true
        }
      }
    ]
  };
}

module.exports = { createTaskModal };
