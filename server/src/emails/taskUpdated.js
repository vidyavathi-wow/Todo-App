module.exports = function taskUpdatedEmail(
  assignedUser,
  updatedBy,
  oldTodo,
  newTodo
) {
  return {
    subject: `Task Updated: ${newTodo.title}`,
    text: `
Hello ${assignedUser.name},

A task assigned to you has been updated.

📌 Updated Task Details
-----------------------------------
• Title: ${newTodo.title}
• Description: ${newTodo.description || 'No description'}
• Category: ${newTodo.category}
• Priority: ${newTodo.priority}
• Status: ${newTodo.status}
• Due Date: ${newTodo.date ? new Date(newTodo.date).toLocaleDateString() : 'Not set'}

📝 Changed Fields
-----------------------------------
${generateChanges(oldTodo, newTodo)}

👤 Updated By
-----------------------------------
${updatedBy.name} (${updatedBy.email})

🔗 Dashboard: ${process.env.FRONTEND_URL}

Regards,
To-Do App Team
`,
  };
};

function generateChanges(oldTodo, newTodo) {
  let changes = '';

  const fields = [
    'title',
    'description',
    'category',
    'priority',
    'status',
    'date',
  ];

  fields.forEach((field) => {
    if (oldTodo[field] !== newTodo[field]) {
      changes += `• ${field}: "${oldTodo[field]}" → "${newTodo[field]}"\n`;
    }
  });

  return changes || 'No major fields changed.';
}
