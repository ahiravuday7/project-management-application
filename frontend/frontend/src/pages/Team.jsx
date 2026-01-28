import React, { useEffect, useState } from "react";
import api from "../api/axios";

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get("/users");
      setMembers(res.data);
    } catch (err) {
      setError("Failed to load team members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-4">Loading team...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-4">{error}</p>;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Team</h3>
        <button className="btn btn-primary">+ Invite Member</button>
      </div>

      <div className="card">
        <div className="card-header fw-bold">Team Members</div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {user.role || "Member"}
                    </span>
                  </td>
                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;
