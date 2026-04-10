import "./Modals.css";

export default function SaveChangesModal({ file, isLoading, onCancel, onConfirm }) {

    return (
        <>
            <div className="modal-overlay">
                <div className="filetree-modal">
                    {isLoading ? (
                        <p> Writing changes to file {file.name}... </p>
                    ) : (
                        <>
                            <p> There are unsaved changes. Do you want to save them? </p>
                            <div className="saveChanges-options">
                                <button className="button-cancel" onClick={onCancel}> Don't Save </button>
                                <button className="button-confirm" onClick={onConfirm}> Save </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
