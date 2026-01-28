import React from "react";

const ApiReference = () => {
  return (
    <div className="container py-4">
      <h2 className="mb-4">API Reference</h2>

      {/* Base URL */}
      <section className="mb-4">
        <h4>Base URL</h4>
        <pre className="bg-light p-3 rounded">http://localhost:5000/api</pre>
      </section>

      {/* Authentication */}
      <section className="mb-4">
        <h4>Authentication</h4>
        <p className="text-muted">
          All protected endpoints require a JWT token. Pass the token in the
          Authorization header.
        </p>
        <pre className="bg-light p-3 rounded">
          Authorization: Bearer &lt;your_token&gt;
        </pre>
      </section>

      {/* User APIs */}
      <section className="mb-4">
        <h4>Users</h4>
        <ul>
          <li>
            <strong>GET /users</strong> – Fetch all registered users (Team)
          </li>
          <li>
            <strong>GET /users/me</strong> – Get logged-in user profile
          </li>
        </ul>
      </section>

      {/* Auth APIs */}
      <section className="mb-4">
        <h4>Authentication APIs</h4>
        <ul>
          <li>
            <strong>POST /auth/register</strong> – Register new user
          </li>
          <li>
            <strong>POST /auth/login</strong> – Login user and get token
          </li>
        </ul>
      </section>

      {/* Board APIs */}
      <section className="mb-4">
        <h4>Boards</h4>
        <ul>
          <li>
            <strong>POST /boards</strong> – Create a new board
          </li>
          <li>
            <strong>GET /boards</strong> – Fetch all boards
          </li>
        </ul>
      </section>

      {/* Column APIs */}
      <section className="mb-4">
        <h4>Columns</h4>
        <ul>
          <li>
            <strong>POST /columns</strong> – Create a column
          </li>
          <li>
            <strong>GET /columns/:boardId</strong> – Get columns by board
          </li>
        </ul>
      </section>

      {/* Task APIs */}
      <section className="mb-4">
        <h4>Tasks</h4>
        <ul>
          <li>
            <strong>POST /tasks</strong> – Create a task
          </li>
          <li>
            <strong>GET /tasks/:columnId</strong> – Get tasks by column
          </li>
          <li>
            <strong>PUT /tasks/:id</strong> – Update task
          </li>
        </ul>
      </section>

      {/* Errors */}
      <section>
        <h4>Error Responses</h4>
        <pre className="bg-light p-3 rounded">
          {`{
  "message": "Not Authorized"
}`}
        </pre>
      </section>
    </div>
  );
};

export default ApiReference;
