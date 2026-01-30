import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI filters
  const [search, setSearch] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Modal selected task
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ This calls: GET http://localhost:5000/api/tasks/my
      const res = await api.get("/tasks/my");
      setTasks(res.data || []);
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load my tasks",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const boards = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const b = t.boardId;
      if (b?._id && !map.has(b._id)) map.set(b._id, b);
    });
    return Array.from(map.values());
  }, [tasks]);

  const statuses = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      const s = t?.columnId?.name;
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        !q ||
        t?.title?.toLowerCase().includes(q) ||
        (t?.description || "").toLowerCase().includes(q);

      const matchesBoard =
        boardFilter === "all" || t?.boardId?._id === boardFilter;

      const matchesStatus =
        statusFilter === "all" || t?.columnId?.name === statusFilter;

      return matchesSearch && matchesBoard && matchesStatus;
    });
  }, [tasks, search, boardFilter, statusFilter]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h2 className="mb-0">My Tasks</h2>
          <small className="text-muted">
            Tasks assigned to your account only
          </small>
        </div>

        <button className="btn btn-outline-primary" onClick={fetchMyTasks}>
          <i className="bi bi-arrow-clockwise me-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <input
                className="form-control"
                placeholder="Search by title/description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
              >
                <option value="all">All Boards</option>
                {boards.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && <div className="alert alert-info">Loading tasks...</div>}

      {!loading && error && (
        <div className="alert alert-danger">
          {error}
          <div className="mt-2 small text-muted">
            Tip: Check browser Network tab → /api/tasks/my response
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="alert alert-warning">
          No assigned tasks found for your account.
          <div className="mt-2 small text-muted">
            Make sure tasks are created with <b>assignedTo</b> set to your user.
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="row g-3">
          {filtered.map((t) => (
            <div className="col-12 col-md-6 col-lg-4" key={t._id}>
              <div
                className="card h-100 shadow-sm"
                onClick={() => setSelectedTask(t)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <h5 className="card-title mb-1">{t.title}</h5>
                    <span className="badge text-bg-secondary">
                      {t?.columnId?.name || "No Status"}
                    </span>
                  </div>

                  <div className="text-muted small mb-2">
                    Board: <b>{t?.boardId?.name || "N/A"}</b>
                  </div>

                  {t.description ? (
                    <p className="card-text">{t.description}</p>
                  ) : (
                    <p className="card-text text-muted fst-italic mb-0">
                      No description
                    </p>
                  )}
                </div>

                <div className="card-footer bg-white border-top d-flex justify-content-between">
                  <small className="text-muted">
                    Updated:{" "}
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "-"}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ FIX: pass open prop so modal actually renders */}
      <TaskModal
        open={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};

export default MyTasks;
