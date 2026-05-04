import "./Modals.css"
import { useState } from "react";

export default function ExportFileModal({ file, isLoading, onConfirm, onCancel }) {
    const [exportFormat, setExportFormat] = useState(file?.type === "pdf" ? "pdf" : "text");

    return (
        <div className="modal-overlay">
            <div className="filetree-modal">
                {isLoading ? (
                    <p className="Loading">Exporting file.... </p>
                ) : (
                    <>
                        <h2>Export File</h2>
                        <div className="export-select-group">
                            <label className="export-select-label" htmlFor="export-type">Export type</label>
                            <select id="export-type" className="select-export-type" value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                                {file?.type === "pdf" ? (
                                    <option value="pdf">PDF</option>
                                ) : (
                                    <option value="text">Text</option>
                                )}
                            </select>
                        </div>
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
