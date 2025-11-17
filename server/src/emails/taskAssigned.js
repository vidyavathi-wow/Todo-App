module.exports = function taskAssignedEmail(assignedUser, assignedBy, todo) {
  return {
    subject: `New Task Assigned: ${todo.title}`,
    text: `
Hello ${assignedUser.name || 'User'},

A new task has been assigned to you in the To-Do Management System.

📌 Task Details
-----------------------------------
• Title: ${todo.title}
• Description: ${todo.description || 'No description provided'}
• Category: ${todo.category || 'Not specified'}
• Priority: ${todo.priority || 'Normal'}
• Status: ${todo.status || 'Pending'}
• Due Date: ${todo.date ? new Date(todo.date).toLocaleDateString() : 'Not set'}

👤 Assigned By
-----------------------------------
Name: ${assignedBy?.name || 'Admin'}
Email: ${assignedBy?.email}


Regards,
To-Do App Team
`,
  };
};
