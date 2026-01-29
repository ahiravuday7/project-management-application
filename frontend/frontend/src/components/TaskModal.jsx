import React from "react";

export default function TaskModal({ open, task, onClose }) {
  if (!open || !task) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={stop}>
        <div style={styles.header}>
          <h3 style={styles.title}>{task.title || "Task Details"}</h3>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.row}>
            <div style={styles.label}>Description</div>
            <div style={styles.value}>
              {task.description?.trim() ? task.description : "—"}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.label}>Assigned To</div>
            <div style={styles.value}>
              {task.assignedTo?.name
                ? `${task.assignedTo.name} (${task.assignedTo.email || ""})`
                : "Unassigned"}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.label}>Status / Column</div>
            <div style={styles.value}>{task.columnId || "—"}</div>
          </div>

          <div style={styles.row}>
            <div style={styles.label}>Created At</div>
            <div style={styles.value}>
              {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.primaryBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },
  modal: {
    width: "min(720px, 100%)",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #eee",
  },
  title: { margin: 0, fontSize: 18 },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 18,
    cursor: "pointer",
    padding: 6,
    lineHeight: 1,
  },
  body: { padding: 16 },
  row: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 4 },
  value: { fontSize: 14, lineHeight: 1.45 },
  footer: {
    padding: "12px 16px",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  primaryBtn: {
    border: "none",
    background: "#111",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
};
