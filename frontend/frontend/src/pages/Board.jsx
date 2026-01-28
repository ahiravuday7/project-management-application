import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [expandedBoardId, setExpandedBoardId] = useState(null);

  // board data (columns + tasks) for expanded board only
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingBoardData, setLoadingBoardData] = useState(false);
  const [error, setError] = useState("");

  // Modals (optional - same as your dashboard)
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnName, setColumnName] = useState("");

  const [showTaskModel, setShowTaskModel] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [activeColumnId, setActiveColumnId] = useState(null);

  // Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  // Fetch all boards
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoadingBoards(true);
        const res = await api.get("/boards");
        setBoards(res.data);
      } catch (e) {
        setError(`Failed to load boards: ${e.message}`);
      } finally {
        setLoadingBoards(false);
      }
    };
    fetchBoards();
  }, []);

  // Fetch columns + tasks for expanded board
  useEffect(() => {
    if (!expandedBoardId) return;

    const fetchBoardData = async () => {
      try {
        setLoadingBoardData(true);
        const [colRes, taskRes] = await Promise.all([
          api.get(`/columns/${expandedBoardId}`),
          api.get(`/tasks/${expandedBoardId}`),
        ]);
        setColumns(colRes.data);
        setTasks(taskRes.data);

        // join socket room for this board
        socket.emit("joinBoard", expandedBoardId);
      } catch {
        setError("Failed to load board data");
      } finally {
        setLoadingBoardData(false);
      }
    };

    fetchBoardData();
  }, [expandedBoardId]);

  // Socket listeners
  useEffect(() => {
    socket.on("taskCreated", (task) => {
      // only push if currently expanded board matches
      if (String(task.boardId) !== String(expandedBoardId)) return;

      setTasks((prev) => {
        const exists = prev.some((t) => t._id === task._id);
        if (exists) return prev;
        return [...prev, task];
      });
    });

    socket.on("taskUpdated", (updatedTask) => {
      if (String(updatedTask.boardId) !== String(expandedBoardId)) return;

      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
      );
    });

    socket.on("taskMoved", ({ taskId, columnId, boardId }) => {
      if (String(boardId) !== String(expandedBoardId)) return;

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, columnId } : t)),
      );
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskMoved");
    };
  }, [expandedBoardId]);

  const getTasksByColumn = (columnId) =>
    tasks.filter((t) => t.columnId === columnId);

  const toggleBoard = (boardId) => {
    setError("");
    if (expandedBoardId === boardId) {
      // collapse
      setExpandedBoardId(null);
      setColumns([]);
      setTasks([]);
      return;
    }
    // expand new board
    setExpandedBoardId(boardId);
  };

  // Create Column (for expanded board only)
  const handleCreateColumn = async () => {
    if (!columnName.trim() || !expandedBoardId) return;

    try {
      const res = await api.post("/columns", {
        name: columnName,
        boardId: expandedBoardId,
      });
      setColumns((prev) => [...prev, res.data]);
      setColumnName("");
      setShowColumnModal(false);
      showToast("Column created!");
    } catch {
      showToast("Failed to create column!", "danger");
    }
  };

  // Create Task (for expanded board only)
  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !activeColumnId || !expandedBoardId) return;

    try {
      await api.post("/tasks", {
        title: taskTitle,
        description: taskDescription,
        assignedTo: assignedTo || null, // keep as string unless backend expects id
        boardId: expandedBoardId,
        columnId: activeColumnId,
      });

      setTaskTitle("");
      setTaskDescription("");
      setAssignedTo("");
      setActiveColumnId(null);
      setShowTaskModel(false);
      showToast("Task created!");
    } catch {
      showToast("Failed to create task!", "danger");
    }
  };

  // Drag end (only for expanded board tasks)
  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    if (movedTask.columnId === destination.droppableId) return;

    // optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggableId ? { ...t, columnId: destination.droppableId } : t,
      ),
    );

    try {
      await api.put(`/tasks/${draggableId}`, {
        columnId: destination.droppableId,
      });

      socket.emit("taskMoved", {
        taskId: draggableId,
        columnId: destination.droppableId,
        boardId: expandedBoardId,
      });
    } catch {
      showToast("Failed to move task!", "danger");
      // revert
      setTasks((prev) =>
        prev.map((t) =>
          t._id === draggableId ? { ...t, columnId: movedTask.columnId } : t,
        ),
      );
    }
  };

  return (
    <div style={{ backgroundColor: "#f1f3f5", minHeight: "100vh" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold m-0">Boards</h3>
        </div>

        {loadingBoards && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loadingBoards && boards.length === 0 && (
          <p className="text-muted">No boards yet.</p>
        )}

        {/* Boards grid */}
        <div className="row g-3">
          {boards.map((b) => {
            const isOpen = expandedBoardId === b._id;

            return (
              <div key={b._id} className="col-12">
                {/* Board Card */}
                <div
                  className="bg-white border rounded-3 p-3 shadow-sm"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleBoard(b._id)}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-1">{b.name}</h5>
                      <div className="text-muted small">
                        {b.description || "No description"}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="badge text-bg-secondary">
                        {isOpen ? "Opened" : "Click to open"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Board Area */}
                {isOpen && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-end mb-2 gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowColumnModal(true);
                        }}
                      >
                        + Add Column
                      </button>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <div className="d-flex gap-3 flex-nowrap overflow-auto pb-2">
                        {columns.map((col) => (
                          <div
                            key={col._id}
                            className="card"
                            style={{ width: 340, minWidth: 340 }}
                          >
                            <div className="card-header fw-bold text-center">
                              {col.name}
                            </div>

                            <Droppable droppableId={col._id}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="card-body"
                                  style={{ minHeight: 320 }}
                                >
                                  <button
                                    className="btn btn-sm btn-outline-primary w-100 mb-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveColumnId(col._id);
                                      setShowTaskModel(true);
                                    }}
                                  >
                                    + Add Task
                                  </button>

                                  {loadingBoardData ? (
                                    <p className="text-center">Loading...</p>
                                  ) : getTasksByColumn(col._id).length === 0 ? (
                                    <p className="text-muted text-center">
                                      No Tasks
                                    </p>
                                  ) : (
                                    getTasksByColumn(col._id).map(
                                      (task, index) => (
                                        <Draggable
                                          key={task._id}
                                          draggableId={task._id}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="card mb-2 shadow-sm"
                                            >
                                              <div className="card-body p-2">
                                                <h6 className="mb-1">
                                                  {task.title}
                                                </h6>
                                                <small className="text-muted">
                                                  {task.description}
                                                </small>
                                                <br />
                                                <small className="text-secondary">
                                                  {task.assignedTo?.name ||
                                                    task.assignedTo ||
                                                    "Unassigned"}
                                                  <br />
                                                  {task.assignedTo?.email || ""}
                                                </small>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ),
                                    )
                                  )}

                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        ))}
                      </div>
                    </DragDropContext>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Column Modal */}
      {showColumnModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Column</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowColumnModal(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Column name (e.g. Todo)"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowColumnModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleCreateColumn}
                >
                  Create Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModel && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Task</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowTaskModel(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Task Title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />

                <textarea
                  className="form-control mb-2"
                  placeholder="Description"
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />

                <input
                  className="form-control"
                  placeholder="Assignee (email or name)"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowTaskModel(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateTask}>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className="toast-container position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1000 }}
        >
          <div className={`toast show text-bg-${toast.type}`}>
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boards;
