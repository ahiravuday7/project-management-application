// import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdminOrManager = user?.role === "Admin" || user?.role === "Manager";

  // ✅ join user room
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.emit("joinUser", user._id);
    }
  }, [isAuthenticated, user?._id]);

  // ✅ load unread count
  useEffect(() => {
    const loadCount = async () => {
      if (!isAuthenticated || !isAdminOrManager) return;
      try {
        const { data } = await api.get("/notifications/unread-count");
        setUnreadCount(data?.count ?? 0);
      } catch (_) {}
    };

    loadCount();
    const onUpdated = () => loadCount();
    window.addEventListener("notifications:updated", onUpdated);
    return () => window.removeEventListener("notifications:updated", onUpdated);
  }, [isAuthenticated, isAdminOrManager]);

  // ✅ realtime badge increment
  useEffect(() => {
    if (!isAuthenticated || !isAdminOrManager) return;
    const handler = () => setUnreadCount((c) => c + 1);
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [isAuthenticated, isAdminOrManager]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        My Project Management App
      </Link>

      {/* 🔽 NEW LINKS (no logic changed) */}
      {isAuthenticated && (
        <ul className="navbar-nav ms-4">
          <li className="nav-item">
            <Link className="nav-link" to="/dashboard">
              Dashboard
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/boards">
              Boards
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/tasks">
              My Tasks
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/team">
              Team
            </Link>
          </li>
        </ul>
      )}
      {/* 🔼 NEW LINKS END */}

      <div className="ms-auto">
        {!isAuthenticated ? (
          <>
            <Link className="btn btn-outline-light me-2" to="/login">
              Login
            </Link>
            <Link className="btn btn-outline-light me-2" to="/register">
              Register
            </Link>
          </>
        ) : (
          <>
            {isAdminOrManager && (
              <Link
                to="/notifications"
                className="btn btn-outline-light me-2 position-relative"
                title="Notifications"
              >
                <i className="bi bi-inbox-fill" />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <span className="text-white me-3">Hi, {user?.name}</span>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
