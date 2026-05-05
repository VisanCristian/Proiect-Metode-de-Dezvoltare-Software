import "./Modals.css";

export default function DeleteFileModal({ file, isLoading, onConfirm, onCancel }) {
    if (!file) return null;

    return (
        <div className="modal-overlay">
            <div className="filetree-modal">
                {isLoading ? (
                    <p>Removing File....</p>
                ) : (
                    <>
                        <p>Are you sure you want to delete {file.name}?</p>
                        <div className="modal-options">
                            <button className="button-confirm" onClick={onConfirm}>Confirm</button>
                            <button className="button-cancel" onClick={onCancel}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
