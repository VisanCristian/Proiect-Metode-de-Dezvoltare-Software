import "./Modals.css";

export default function CreateFolderModal({ folderName, isLoading, onFolderNameChange, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="filetree-modal">
                {isLoading ? (
                    <p>Creating the new folder....</p>
                ) : (
                    <>
                        <h2>Add a new Folder</h2>
                        <input
                            className="text-input"
                            type="text"
                            value={folderName}
                            onChange={(event) => onFolderNameChange(event.target.value)}
                            placeholder="New Folder Name"
                        />
                        <div className="modal-options">
                            <button className="button-confirm" onClick={onConfirm} disabled={!folderName.trim()}>
                                Confirm
                            </button>
                            <button className="button-cancel" onClick={onCancel}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
