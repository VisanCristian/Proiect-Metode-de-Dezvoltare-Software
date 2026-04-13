import "./Modals.css"

export default function SuccessSaveModal({ isLoading, onConfirm }) {
    return (
        <>
            <dev className="modal-overlay">
                <dev className="filetree-modal">
                    {isLoading ? (
                        <p> Saving file.... </p>
                    ) : (
                        <>
                            <p>File has been saved succesfully </p>
                            <div className="modal-options">
                                <button className="button-confirm" onClick={onConfirm}> Ok </button>
                            </div>
                        </>
                    )}
                </dev>
            </dev >
        </>
    );
}
