import React, { useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const [selectedBoard, setSelectedBoard] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const [showTaskModel, setShowTaskModel] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, settaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [activeColumnId, setActiveColumnId] = useState(null);

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnName, setColumnName] = useState("");

  const [users, setUsers] = useState([]);

  // Toast Notification logic
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // success / danger
  });

  //Fetch Board
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get("/boards");
        setBoards(res.data);
      } catch (error) {
        setError(`Failed to load the boards ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  //Fetch columns + tasks
  useEffect(() => {
    if (!selectedBoard) return;

    const fetchBoardData = async () => {
      try {
        setTaskLoading(true);
        const [colRes, taskRes] = await Promise.all([
          api.get(`/columns/${selectedBoard._id}`),
          api.get(`/tasks/${selectedBoard._id}`),
        ]);
        setColumns(colRes.data);
        setTasks(taskRes.data);
      } catch {
        setError(`Failed to load board data`);
      } finally {
        setTaskLoading(false);
      }
    };
    fetchBoardData();
    socket.emit("joinBoard", selectedBoard._id);
  }, [selectedBoard]);

  // Listen to task events
  useEffect(() => {
    socket.on("taskCreated", (task) => {
      // setTasks((prev) => [...prev, task]);
      setTasks((prev) => {
        const exists = prev.some((t) => t._id === task._id);
        if (exists) return prev;
        return [...prev, task];
      });
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)),
      );
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
    };
  }, []);

  //Create board
  const handleCreateBoard = async () => {
    if (!boardName.trim()) return;

    try {
      const res = await api.post("/boards", {
        name: boardName,
        description: boardDescription,
      });

      setBoards([...boards, res.data]);
      setToast({
        show: true,
        message: "Board created successfully!",
        type: "success",
      });
      setBoardName("");
      setBoardDescription("");
      setShowModal(false);
    } catch {
      setToast({
        show: true,
        message: "Failed to create board!",
        type: "danger",
      });
    }

    // Auto hide toast after 3sec
    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 3000);
  };

  // Create Column handler
  const handleCreateColumn = async () => {
    if (!columnName.trim() || !selectedBoard) return;

    try {
      const res = await api.post("/columns", {
        name: columnName,
        boardId: selectedBoard._id,
      });

      setColumns((prev) => [...prev, res.data]);

      // Clear the columns field
      setColumnName("");
      setShowColumnModal(false);
    } catch {
      setToast({
        show: true,
        message: "Failed to create column!",
        type: "danger",
      });
    }

    // Auto hide toast after 3sec
    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 3000);
  };

  // Filter tasks by column
  const getTasksByColumn = (columnId) => {
    return tasks.filter((task) => task.columnId === columnId);

    // const showToast = (message, type = "success") => {
    //   setToast({ show: true, message, type });
    //   setTimeout(() => setToast({ show: false }), 3000);
    // };
  };

  // Create task handler (Create task in column)
  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !activeColumnId) return;

    try {
      const res = await api.post("/tasks", {
        title: taskTitle,
        description: taskDescription,
        assignedTo: assignedTo || null, // assignedTo will now be userId string
        boardId: selectedBoard._id,
        columnId: activeColumnId,
      });

      // setTasks((prev) => [...prev, res.data]);

      // reset
      setTaskTitle("");
      settaskDescription("");
      setAssignedTo("");
      setActiveColumnId(null);
      setShowModal(false);
      setShowTaskModel(false);
    } catch {
      setToast({
        show: true,
        message: "Failed to create task!",
        type: "danger",
      });
    }
  };

  // Add Drag handler
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // dropped outside
    if (!destination) return;

    // dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // find dragged task
    const movedTask = tasks.find((t) => t._id === draggableId);

    if (!movedTask) return;

    // optimistic UI update
    setTasks((prev) =>
      prev.map((task) =>
        task._id === draggableId
          ? { ...task, columnId: destination.droppableId }
          : task,
      ),
    );

    try {
      // Update the backend
      await api.put(`/tasks/${draggableId}`, {
        columnId: destination.droppableId,
      });

      // notify others via socket
      socket.emit("taskMoved", {
        taskId: draggableId,
        columnId: destination.droppableId,
      });
    } catch {
      setToast({
        show: true,
        message: "Failed to move task!",
        type: "danger",
      });
    }
  };

  // Fetch users
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

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-3 bg-light border-end p-3">
          <h5 className="mb-3">Boards</h5>

          {loading && <p>Loading...</p>}
          {error && <p className="text-danger">{error}</p>}

          {/* Empty State Message */}
          {!loading && boards.length === 0 && (
            <p className="text-muted">No boards yet. Create one!</p>
          )}

          <ul className="list-group mt-3">
            {boards.map((board) => (
              <li
                key={board._id}
                className={`list-group-item ${
                  selectedBoard?._id === board._id ? "active" : ""
                }`}
                onClick={() => setSelectedBoard(board)}
                style={{ cursor: "pointer" }}
              >
                {board.name}
              </li>
            ))}
          </ul>

          <button
            className="btn btn-warning w-100 mt-3"
            onClick={() => setShowModal(true)}
          >
            + Create Board
          </button>
        </div>

        {/* Main Content */}
        <div className="col-9 p-4">
          {!selectedBoard ? (
            <h4>Select a board to view tasks</h4>
          ) : (
            <>
              <h4>{selectedBoard.name}</h4>
              <p className="text-muted">{selectedBoard.description}</p>

              {/* Add Create Column Button */}
              <div className="d-flex justify-content-end mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowColumnModal(true)}
                >
                  + Add Column
                </button>
              </div>

              {/* Design to get columns and tasks */}
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="row mt-3">
                  {columns.map((col) => (
                    <div className="col-4" key={col._id}>
                      <Droppable droppableId={col._id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="card"
                          >
                            <div className="card-header d-flex justify-centent-between fw-bold text-center">
                              {col.name}
                            </div>

                            <div
                              className="card-body"
                              style={{ minHeight: "300px" }}
                            >
                              {/* Create a button to add the tasks */}
                              <button
                                className="btn btn-sm btn-outline-primary w-100 mb-3"
                                onClick={() => {
                                  setActiveColumnId(col._id);
                                  setShowTaskModel(true);
                                }}
                              >
                                + Add Task
                              </button>

                              {taskLoading ? (
                                <p className="text-center">Loading...</p>
                              ) : getTasksByColumn(col._id).length === 0 ? (
                                <p className="text-muted text-center">
                                  No Tasks
                                </p>
                              ) : (
                                getTasksByColumn(col._id).map((task, index) => (
                                  <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                    className="card mb-2 shadow-sm"
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="card mb-2 shadow-sm"
                                      >
                                        <div className="card-body p-2">
                                          <h6 className="mb-1">{task.title}</h6>
                                          <small className="text-muted">
                                            {task.description}
                                          </small>
                                          <br />
                                          <small className="text-secondary">
                                            {task.assignedTo?.name ? (
                                              <>
                                                {task.assignedTo.name}
                                                {task.assignedTo.email && (
                                                  <>
                                                    <br />
                                                    {task.assignedTo.email}
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
                                ))
                              )}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            </>
          )}
        </div>

        {/* Board Create Logic */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Create Board</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Board name"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                  />

                  <textarea
                    className="form-control"
                    placeholder="Board description"
                    rows="3"
                    value={boardDescription}
                    onChange={(e) => setBoardDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="model-footer p-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary ms-2"
                    onClick={handleCreateBoard}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Column Model UI */}
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

      {/* Create Task Model UI */}
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
                  onChange={(e) => settaskDescription(e.target.value)}
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

      {/* Display toast */}
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

export default Dashboard;
