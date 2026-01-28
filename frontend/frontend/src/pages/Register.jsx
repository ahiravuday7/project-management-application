import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/auth/register", form);
    navigate("/login");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow-sm" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">Register</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            className="form-control mb-2"
            placeholder="Name"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            className="form-control mb-2"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            className="form-control mb-2"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            className="form-control mb-3"
            onChange={handleChange}
          >
            <option value="Member">Member</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>

          <button className="btn btn-success w-100">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
