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
                            <button className="button-success" onClick={onConfirm}> Ok </button>
                        </>
                    )}
                </dev>
            </dev>
        </>
    );
}
