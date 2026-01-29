import React, { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../pages/board.css";

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [expandedBoardId, setExpandedBoardId] = useState(null);

  // board data (columns + tasks) for expanded board only
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingBoardData, setLoadingBoardData] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnName, setColumnName] = useState("");

  const [showTaskModel, setShowTaskModel] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [activeColumnId, setActiveColumnId] = useState(null);

  const [users, setUsers] = useState([]);

  // ✅ Rename Board Modal state (NEW)
  const [showRenameBoardModal, setShowRenameBoardModal] = useState(false);
  const [renameBoardId, setRenameBoardId] = useState(null);
  const [renameBoardName, setRenameBoardName] = useState("");
  const [renameBoardDescription, setRenameBoardDescription] = useState("");

  // ✅ Create Board Modal (NEW)
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  // ✅ Edit Column Modal
  const [showEditColumnModal, setShowEditColumnModal] = useState(false);
  const [editColumnId, setEditColumnId] = useState(null);
  const [editColumnName, setEditColumnName] = useState("");

  // ✅ Edit Task Modal
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskAssignedTo, setEditTaskAssignedTo] = useState("");

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

  const [editMode, setEditMode] = useState(false);

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

    // ✅ NEW: realtime delete sync
    socket.on("taskDeleted", ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskMoved");
      socket.off("taskDeleted");
    };
  }, [expandedBoardId]);

  const getTasksByColumn = (columnId) =>
    tasks.filter((t) => t.columnId === columnId);

  const toggleBoard = (boardId) => {
    setError("");
    if (expandedBoardId === boardId) {
      setExpandedBoardId(null);
      setColumns([]);
      setTasks([]);
      return;
    }
    setExpandedBoardId(boardId);
  };

  // Create Column
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

  // Create Task
  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !activeColumnId || !expandedBoardId) return;

    try {
      await api.post("/tasks", {
        title: taskTitle,
        description: taskDescription,
        assignedTo: assignedTo || null,
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

  // Drag end
  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    if (movedTask.columnId === destination.droppableId) return;

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
      setTasks((prev) =>
        prev.map((t) =>
          t._id === draggableId ? { ...t, columnId: movedTask.columnId } : t,
        ),
      );
    }
  };

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    };
    fetchUsers();
  }, []);

  // ✅ OPEN rename popup (NEW)
  const openRenamePopup = (board) => {
    setRenameBoardId(board._id);
    setRenameBoardName(board.name || "");
    setRenameBoardDescription(board.description || "");
    setShowRenameBoardModal(true);
  };

  // ✅ SAVE rename popup changes (NEW)
  const handleSaveRenameBoard = async () => {
    if (!renameBoardId) return;

    const name = renameBoardName.trim();
    const description = renameBoardDescription.trim();

    if (!name) {
      showToast("Board name is required", "danger");
      return;
    }

    try {
      const res = await api.put(`/boards/${renameBoardId}`, {
        name,
        description,
      });

      setBoards((prev) =>
        prev.map((b) => (b._id === renameBoardId ? res.data : b)),
      );

      // optional: if you want the currently opened board title to reflect instantly
      // it already will because boards state is updated.

      setShowRenameBoardModal(false);
      setRenameBoardId(null);
      setRenameBoardName("");
      setRenameBoardDescription("");
      showToast("Board updated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update board", "danger");
    }
  };

  // ✅ Close rename popup (NEW)
  const closeRenamePopup = () => {
    setShowRenameBoardModal(false);
    setRenameBoardId(null);
    setRenameBoardName("");
    setRenameBoardDescription("");
  };

  // Delete Board
  const handleDeleteBoard = async (board) => {
    const ok = window.confirm(
      `Delete "${board.name}"?\nAll columns and tasks inside this board will also be deleted.`,
    );
    if (!ok) return;

    try {
      await api.delete(`/boards/${board._id}`);

      setBoards((prev) => prev.filter((b) => b._id !== board._id));

      if (expandedBoardId === board._id) {
        setExpandedBoardId(null);
        setColumns([]);
        setTasks([]);
      }

      showToast("Board deleted!");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete board", "danger");
    }
  };

  // ✅ Create Board (NEW)
  const handleCreateBoard = async () => {
    const name = boardName.trim();
    const description = boardDescription.trim();

    if (!name) {
      showToast("Board name is required", "danger");
      return;
    }

    try {
      const res = await api.post("/boards", { name, description });

      setBoards((prev) => [...prev, res.data]);

      setBoardName("");
      setBoardDescription("");
      setShowCreateBoardModal(false);

      showToast("Board created!");
    } catch (err) {
      console.error(err);
      showToast("Failed to create board!", "danger");
    }
  };

  // Column functions (open/save/delete)
  const openEditColumnPopup = (col) => {
    setEditColumnId(col._id);
    setEditColumnName(col.name || "");
    setShowEditColumnModal(true);
  };

  const closeEditColumnPopup = () => {
    setShowEditColumnModal(false);
    setEditColumnId(null);
    setEditColumnName("");
  };

  const handleSaveColumn = async () => {
    const name = editColumnName.trim();
    if (!editColumnId || !name) {
      showToast("Column name is required", "danger");
      return;
    }

    try {
      const res = await api.put(`/columns/${editColumnId}`, { name });

      setColumns((prev) =>
        prev.map((c) => (c._id === editColumnId ? res.data : c)),
      );

      closeEditColumnPopup();
      showToast("Column updated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update column", "danger");
    }
  };

  const handleDeleteColumn = async (col) => {
    const ok = window.confirm(
      `Delete column "${col.name}"?\nAll tasks inside this column may also be deleted.`,
    );
    if (!ok) return;

    try {
      await api.delete(`/columns/${col._id}`);

      // remove column
      setColumns((prev) => prev.filter((c) => c._id !== col._id));

      // remove tasks under this column from UI
      setTasks((prev) => prev.filter((t) => t.columnId !== col._id));

      showToast("Column deleted!");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete column", "danger");
    }
  };

  // Task functions (open/save/delete)
  const openEditTaskPopup = (task) => {
    setEditTaskId(task._id);
    setEditTaskTitle(task.title || "");
    setEditTaskDescription(task.description || "");
    setEditTaskAssignedTo(task.assignedTo?._id || ""); // store userId string
    setShowEditTaskModal(true);
  };

  const closeEditTaskPopup = () => {
    setShowEditTaskModal(false);
    setEditTaskId(null);
    setEditTaskTitle("");
    setEditTaskDescription("");
    setEditTaskAssignedTo("");
  };

  const handleSaveTask = async () => {
    const title = editTaskTitle.trim();
    const description = editTaskDescription.trim();

    if (!editTaskId || !title) {
      showToast("Task title is required", "danger");
      return;
    }

    try {
      const res = await api.put(`/tasks/${editTaskId}`, {
        title,
        description,
        assignedTo: editTaskAssignedTo || null,
      });

      setTasks((prev) =>
        prev.map((t) => (t._id === editTaskId ? res.data : t)),
      );

      closeEditTaskPopup();
      showToast("Task updated!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update task", "danger");
    }
  };

  const handleDeleteTask = async (task) => {
    const ok = window.confirm(`Delete task "${task.title}"?`);
    if (!ok) return;

    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      showToast("Task deleted!");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete task", "danger");
    }
  };

  return (
    <div style={{ backgroundColor: "#f1f3f5", minHeight: "100vh" }}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold m-0">Boards</h3>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-warning"
              onClick={() => setShowCreateBoardModal(true)}
            >
              + Create Board
            </button>

            <button
              className={`btn ${editMode ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? "Done" : "Edit"}
            </button>
          </div>
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

                      {/* ✅ Show Rename / Delete buttons when Edit Mode is ON */}
                      {editMode && (
                        <div className="d-flex gap-3">
                          {/* Edit icon */}
                          <i
                            className="bi bi-pencil-square text-primary bi-action"
                            title="Edit board"
                            style={{ cursor: "pointer", fontSize: "1.1rem" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openRenamePopup(b);
                            }}
                          />

                          {/* Delete icon */}
                          <i
                            className="bi bi-trash text-danger bi-action"
                            title="Delete board"
                            style={{ cursor: "pointer", fontSize: "1.1rem" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBoard(b);
                            }}
                          />
                        </div>
                      )}
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
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <span className="fw-bold">{col.name}</span>

                              {editMode && (
                                <div className="d-flex gap-2">
                                  <i
                                    className="bi bi-pencil-square text-primary bi-action"
                                    title="Edit column"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditColumnPopup(col);
                                    }}
                                  />
                                  <i
                                    className="bi bi-trash text-danger bi-action"
                                    title="Delete column"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteColumn(col);
                                    }}
                                  />
                                </div>
                              )}
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
                                                <div className="d-flex justify-content-between align-items-start">
                                                  <h6 className="mb-1">
                                                    {task.title}
                                                  </h6>

                                                  {editMode && (
                                                    <div className="d-flex gap-2">
                                                      <i
                                                        className="bi bi-pencil-square text-primary bi-action"
                                                        title="Edit task"
                                                        style={{
                                                          cursor: "pointer",
                                                        }}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          openEditTaskPopup(
                                                            task,
                                                          );
                                                        }}
                                                      />
                                                      <i
                                                        className="bi bi-trash text-danger bi-action"
                                                        title="Delete task"
                                                        style={{
                                                          cursor: "pointer",
                                                        }}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleDeleteTask(
                                                            task,
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                  )}
                                                </div>

                                                <small className="text-muted">
                                                  {task.description}
                                                </small>
                                                <br />
                                                <small className="text-secondary">
                                                  {task.assignedTo?.name ? (
                                                    <>
                                                      {task.assignedTo.name}
                                                      {task.assignedTo
                                                        .email && (
                                                        <>
                                                          <br />
                                                          {
                                                            task.assignedTo
                                                              .email
                                                          }
                                                        </>
                                                      )}
                                                    </>
                                                  ) : (
                                                    "Unassigned"
                                                  )}
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
      {/* ✅ Rename Board Modal (NEW) */}
      {showRenameBoardModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rename Board</h5>
                <button className="btn-close" onClick={closeRenamePopup} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Board Name</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter board name"
                  value={renameBoardName}
                  onChange={(e) => setRenameBoardName(e.target.value)}
                />

                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Enter board description"
                  rows={3}
                  value={renameBoardDescription}
                  onChange={(e) => setRenameBoardDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeRenamePopup}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveRenameBoard}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ✅ Create Board Modal (NEW) */}
      {showCreateBoardModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Board</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateBoardModal(false)}
                />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Board Name</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter board name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />

                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Enter board description"
                  rows={3}
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateBoardModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateBoard}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
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

      {/* Create Column Modal */}
      {showEditColumnModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Column</h5>
                <button className="btn-close" onClick={closeEditColumnPopup} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Column Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editColumnName}
                  onChange={(e) => setEditColumnName(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeEditColumnPopup}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveColumn}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create Task Modal */}
      {showEditTaskModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task</h5>
                <button className="btn-close" onClick={closeEditTaskPopup} />
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Title</label>
                <input
                  type="text"
                  className="form-control mb-3"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                />

                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control mb-3"
                  rows={3}
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                />

                <label className="form-label fw-semibold">Assign To</label>
                <select
                  className="form-select"
                  value={editTaskAssignedTo}
                  onChange={(e) => setEditTaskAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeEditTaskPopup}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveTask}>
                  Save
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
