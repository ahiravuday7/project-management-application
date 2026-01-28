import React, { useState } from "react";
import api from "../api/axios";

const ContactSupport = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/support", form);
      alert("Your message has been sent to support!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      alert("Failed to send support request");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <h2 className="mb-3">Contact Support</h2>

      <p className="text-muted mb-4">
        Need help or facing an issue? Fill out the form below and our support
        team will get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            name="message"
            rows="4"
            className="form-control"
            placeholder="Describe your issue or question"
            value={form.message}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Request
        </button>
      </form>

      {/* Support Info */}
      <div className="mt-4 text-muted">
        <p>
          📧 Email: <strong>support@taskflow.com</strong>
        </p>
        <p>⏰ Support Hours: Monday – Friday, 9:00 AM – 6:00 PM</p>
      </div>
    </div>
  );
};

export default ContactSupport;
