import "./Modals.css";

export default function DeleteFolderModal({ folder, files, isLoading, onConfirm, onCancel }) {
    return (
        <>
            <div className="modal-overlay">
                <div className="filetree-modal">
                    {isLoading ? (
                        <p>Deleting current folder...</p>
                    ) : (
                        <>
                            <p>
                                Are you sure you want to delete {folder?.name ?? "this folder"}? The following files will also be deleted:
                            </p>
                            {files.map((file) => (
                                <p key={file.id}> {file.name} </p>
                            ))}
                            <button className="button-confirm" onClick={onConfirm}>Confirm</button>
                            <button className="button-cancel" onClick={onCancel}>Cancel</button>
                        </>
                    )}
                </div>
            </div>
        </>);
}
