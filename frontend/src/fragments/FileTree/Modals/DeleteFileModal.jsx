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
                        <button className="confirm" onClick={onConfirm}>Confirm</button>
                        <button className="cancel" onClick={onCancel}>Cancel</button>
                    </>
                )}
            </div>
        </div>
    );
}
