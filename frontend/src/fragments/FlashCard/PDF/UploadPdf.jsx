import "./uploadPdf.css";


export default function UploadPdfModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="upload-modal-backdrop">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h3>Add new</h3>
          <button className="upload-modal-close" onClick={onClose}>Close</button>
        </div>

        <p className="upload-modal-desc">
          Adaugă PDF‑ul pe care vrei să îl sumarizezi în cartonașe.
        </p>

        <div className="upload-modal-input">
          <input type="file" accept="application/pdf" />
        </div>

        <div className="upload-modal-actions">
          <button className="btn-end" onClick={onClose}>Cancel</button>
          <button className="btn-primary" type="button">Upload</button>
        </div>
      </div>
    </div>
  );
}