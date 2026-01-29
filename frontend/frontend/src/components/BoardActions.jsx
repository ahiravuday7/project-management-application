import { useState } from "react";
import api from "../api/axios";

const BoardActions = ({
  activeBoard,
  onBoardUpdated,
  onBoardDeleted,
  disabled,
  showToast,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openRename = () => {
    if (!activeBoard) return;
    setName(activeBoard.name || "");
    setDescription(activeBoard.description || "");
    setShowRenameModal(true);
    setShowMenu(false);
  };

  const updateBoard = async () => {
    if (!name.trim()) return;

    try {
      const res = await api.put(`/boards/${activeBoard._id}`, {
        name,
        description,
      });

      onBoardUpdated(res.data);
      setShowRenameModal(false);
      showToast("Board updated!");
    } catch {
      showToast("Failed to update board", "danger");
    }
  };

  const deleteBoard = async () => {
    const ok = window.confirm(
      `Delete "${activeBoard.name}"?\nAll columns and tasks inside this board will also be deleted.`,
    );
    if (!ok) return;

    try {
      await api.delete(`/boards/${activeBoard._id}`);
      onBoardDeleted(activeBoard._id);
      setShowMenu(false);
      showToast("Board deleted!");
    } catch {
      showToast("Failed to delete board", "danger");
    }
  };

  return (
    <>
      {/* Header Edit Button */}
      <div className="position-relative">
        <button
          className="btn btn-outline-secondary"
          disabled={disabled}
          onClick={() => setShowMenu((v) => !v)}
        >
          Edit
        </button>

        {showMenu && (
          <div
            className="dropdown-menu show"
            style={{ right: 0, left: "auto" }}
          >
            <button className="dropdown-item" onClick={openRename}>
              Update (rename) board
            </button>
            <button className="dropdown-item text-danger" onClick={deleteBoard}>
              Delete board
            </button>
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Board</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowRenameModal(false)}
                />
              </div>

              <div className="modal-body">
                <label className="form-label">Board name</label>
                <input
                  className="form-control mb-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={updateBoard}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardActions;
