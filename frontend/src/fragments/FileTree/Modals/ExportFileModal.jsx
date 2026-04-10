import "./Modals.css"
import { useEffect, useState } from "react";

export default function ExportFileModal({ file, isLoading, onConfirm, onCancel }) {
    const [exportFormat, setExportFormat] = useState("text");
    return (
        <div className="modal-overlay">
            <div className="filetree-modal">
                {isLoading ? (
                    <p className="Loading">Exporting file.... </p>
                ) : (
                    <>
                        < select className="select-export-type" onChange={(e) => setExportFormat(e.target.value)}>
                            <option value="text">Text</option>
                            <option value="pdf">PDF</option>
                        </select>
                        <div className="modal-options">
                            <button className="button-cancel" onClick={onCancel}>Cancel </button>
                            <button className="button-confirm" onClick={() => onConfirm(exportFormat)}>Confirm </button>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
}
