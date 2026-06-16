import "./EditFileScreen.css";
import { useEffect, useMemo, useState } from "react";
import { getFileContent } from "../../../../services/filetree_api.js";
import MarkdownRenderer from "../../../MarkdownRenderer/MarkdownRenderer";

function buildPdfUrl(base64Content) {
    return `data:application/pdf;base64,${base64Content}`;
}

export default function EditFileScreen({ file, onBack, onSave, onConvertToPdf }) {
    const [originalContent, setOriginalContent] = useState("");
    const [draftContent, setDraftContent] = useState("");
    const [fileData, setFileData] = useState(null);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [contentError, setContentError] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const hasUnsavedChanges = draftContent !== originalContent;
    const isPdfFile = (fileData?.type || file.type) === "pdf";
    const isMarkdownFile = file.name.toLowerCase().endsWith(".md");

    useEffect(() => {
        setDraftContent("");
        setOriginalContent("");
        
        if (file.isNew) {
            setDraftContent(file.content || "");
            setOriginalContent("");
            setFileData({ type: "text", content: file.content || "" });
        } else {
            loadContent(file.id);
        }
    }, [file.id, file.isNew, file.content]);

    const pdfUrl = useMemo(() => {
        if (!fileData || fileData.type !== "pdf") {
            return "";
        }

        return buildPdfUrl(fileData.content);
    }, [fileData]);

    async function loadContent(file_id) {
        try {
            setIsLoadingContent(true);
            setContentError(false);
            const data = await getFileContent(file_id);
            setFileData(data);

            if (data.type !== "pdf") {
                setOriginalContent(data.content);
                setDraftContent(data.content);
            }
        } catch (err) {
            console.error("Eroare la incarcarea continutului fisierului:", err);
            setContentError(true);
        } finally {
            setIsLoadingContent(false);
        }
    }

    async function handleSave() {
        if (!isPdfFile && hasUnsavedChanges) {
            const wasSaved = await onSave(draftContent);

            if (wasSaved) {
                setOriginalContent(draftContent);
            }
        }
    }

    async function handleConvertToPdf() {
        try {
            setIsConverting(true);
            await onConvertToPdf(file);
        } catch (error) {
            console.error("Could not convert the markdown file to PDF:", error);
        } finally {
            setIsConverting(false);
        }
    }

    return (
        <div className="file-edit-subpage">
            {isLoadingContent ? (
                <p className="loading">Loading content.....</p>
            ) : contentError || !fileData ? (
                <p className="loading">Could not load the file content.</p>
            ) : (
                <>
                    <div className="edit-options">
                        <h2>Editing File: {file.name}</h2>
                        <button className="button-back" onClick={() => onBack(hasUnsavedChanges && !isPdfFile, draftContent)}>Back</button>
                        <button className="button-save-changes" onClick={handleSave} disabled={isPdfFile || !hasUnsavedChanges}>
                            Save Changes
                        </button>
                    </div>
                    <div className="edit-content">
                        {!isPdfFile && (
                            <div className="edit-content-options">
                                <button
                                    className={!previewMode ? "active-tab" : ""}
                                    onClick={() => setPreviewMode(false)}
                                >Edit</button>
                                <button
                                    className={previewMode ? "active-tab" : ""}
                                    onClick={() => setPreviewMode(true)}
                                >Preview</button>
                                {isMarkdownFile && (
                                    <button className="button-pdf" onClick={handleConvertToPdf} disabled={isConverting}>
                                        {isConverting ? "Converting..." : "Convert to PDF"}
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="edit-content-display">
                            {isPdfFile ? (
                                <div className="pdf-preview-wrapper">
                                    <p className="pdf-preview-message">PDF files can only be previewed.</p>
                                    <iframe className="pdf-frame" src={pdfUrl} title={file.name} />
                                </div>
                            ) : previewMode ? (
                                <div className="rendered-content">
                                    <MarkdownRenderer content={draftContent} />
                                </div>
                            ) : (
                                <textarea
                                    className="file-editor"
                                    value={draftContent}
                                    onChange={(e) => setDraftContent(e.target.value)}
                                    placeholder="Write file content here....."
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
