import "./Modals.css";

export default function AddFileModal({ file, isLoading, onFileChange, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="filetree-modal">
                {isLoading ? (
                    <p>Adding the new file....</p>
                ) : (
                    <>
                        <h2>Add a new File</h2>
                        <div className="file-upload-area">
                            <label className="file-upload-button" htmlFor="add-file-input">
                                Choose File
                            </label>
                            <input
                                id="add-file-input"
                                className="file-upload-input"
                                type="file"
                                onChange={(event) => onFileChange(event.target.files[0])}
                            />
                            <p className="selected-file-name">
                                {file ? `Selected file: ${file.name}` : "No file selected"}
                            </p>
                        </div>
                        <div className="modal-options">
                            <button className="button-confirm" onClick={onConfirm} disabled={!file}>
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
