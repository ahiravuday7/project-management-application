import React, { useEffect, useState } from "react";
import api from "../api/axios";

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ticket, setTicket] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data?.notifications ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n,
      ),
    );
    window.dispatchEvent(new Event("notifications:updated"));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/mark-all-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event("notifications:updated"));
  };

  const viewTicket = async (notif) => {
    setSelected(notif);
    setTicket(null);

    if (notif?._id) await markRead(notif._id);

    const supportId = notif?.data?.supportId;
    if (!supportId) return;

    const { data } = await api.get(`/support/${supportId}`);
    setTicket(data?.ticket ?? null);
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Notifications</h3>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={load}>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={markAllRead}>
            Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-secondary">No notifications yet.</div>
      ) : (
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="list-group">
              {notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  className={`list-group-item list-group-item-action ${!n.isRead ? "active" : ""}`}
                  onClick={() => viewTicket(n)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{n.title}</h6>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                  <p className="mb-1">{n.body}</p>
                  {!n.isRead && <small>Unread</small>}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Support Request</h5>
                {!selected ? (
                  <div className="text-muted">
                    Select a notification to view details.
                  </div>
                ) : !ticket ? (
                  <div className="text-muted">Loading support request...</div>
                ) : (
                  <>
                    <div>
                      <strong>Name:</strong> {ticket.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {ticket.email}
                    </div>
                    <div>
                      <strong>Created:</strong>{" "}
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <strong>Message:</strong>
                      <div
                        className="border rounded p-2 mt-1"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {ticket.message}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
