import React from "react";

const HelpCenter = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Help Center</h2>

      {/* Getting Started */}
      <section className="mb-4">
        <h4>Getting Started</h4>
        <p className="text-muted">
          New to TaskFlow? Start by creating an account, then create your first
          board to organize your work.
        </p>
        <ul>
          <li>Register or log in to your account</li>
          <li>Create a board</li>
          <li>Add columns and tasks</li>
        </ul>
      </section>

      {/* Account */}
      <section className="mb-4">
        <h4>Account & Login</h4>
        <ul>
          <li>Make sure your email and password are correct</li>
          <li>If login fails, try logging out and logging in again</li>
          <li>Contact support if you forget your password</li>
        </ul>
      </section>

      {/* Boards & Tasks */}
      <section className="mb-4">
        <h4>Boards & Tasks</h4>
        <ul>
          <li>Create boards to manage different projects</li>
          <li>Use columns like Todo, In Progress, and Done</li>
          <li>Drag and drop tasks to update their status</li>
        </ul>
      </section>

      {/* Team */}
      <section className="mb-4">
        <h4>Team Management</h4>
        <ul>
          <li>View all registered users in the Team page</li>
          <li>Admins can manage team members</li>
          <li>Assign tasks to team members</li>
        </ul>
      </section>

      {/* Troubleshooting */}
      <section className="mb-4">
        <h4>Troubleshooting</h4>
        <ul>
          <li>If data is not loading, refresh the page</li>
          <li>Make sure you are logged in</li>
          <li>Check your internet connection</li>
        </ul>
      </section>

      {/* Contact */}
      <section>
        <h4>Contact Support</h4>
        <p className="text-muted">
          Still need help? Reach out to our support team.
        </p>
        <ul>
          <li>Email: support@taskflow.com</li>
          <li>Working hours: Mon – Fri, 9 AM – 6 PM</li>
        </ul>
      </section>
    </div>
  );
};

export default HelpCenter;
