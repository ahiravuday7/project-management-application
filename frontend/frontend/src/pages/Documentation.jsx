import React from "react";

const Documentation = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">Documentation</h2>

      {/* Overview */}
      <section className="mb-4">
        <h4>Overview</h4>
        <p className="text-muted">
          TaskFlow is a project management application that helps teams organize
          work, track tasks, and collaborate efficiently.
        </p>
      </section>

      {/* Features */}
      <section className="mb-4">
        <h4>Key Features</h4>
        <ul>
          <li>Create and manage boards</li>
          <li>Organize work using columns and tasks</li>
          <li>Drag and drop tasks between columns</li>
          <li>Team collaboration and role management</li>
          <li>Secure authentication using JWT</li>
        </ul>
      </section>

      {/* How to Use */}
      <section className="mb-4">
        <h4>How to Use</h4>
        <ol>
          <li>Register or log in to your account</li>
          <li>Create a new board</li>
          <li>Add columns (Todo, In Progress, Done)</li>
          <li>Create and assign tasks</li>
          <li>Track progress and collaborate with your team</li>
        </ol>
      </section>

      {/* Roles */}
      <section className="mb-4">
        <h4>User Roles</h4>
        <ul>
          <li>
            <strong>Admin:</strong> Manage boards, users, and roles
          </li>
          <li>
            <strong>Member:</strong> Create and update tasks
          </li>
          <li>
            <strong>Viewer:</strong> Read-only access
          </li>
        </ul>
      </section>

      {/* API */}
      <section className="mb-4">
        <h4>API Overview</h4>
        <p className="text-muted">
          TaskFlow uses REST APIs to manage authentication, boards, tasks, and
          team members. All protected APIs require a JWT token.
        </p>

        <pre className="bg-light p-3 rounded">
          GET /api/auth/login{"\n"}
          GET /api/users{"\n"}
          POST /api/boards{"\n"}
          POST /api/tasks
        </pre>
      </section>

      {/* Help */}
      <section>
        <h4>Need Help?</h4>
        <p className="text-muted">
          If you face any issues, please contact support or refer to the Help
          Center.
        </p>
      </section>
    </div>
  );
};

export default Documentation;
