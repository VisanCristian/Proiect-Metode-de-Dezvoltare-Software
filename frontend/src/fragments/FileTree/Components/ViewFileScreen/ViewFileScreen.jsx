import "./ViewFileScreen.css";
import { useEffect, useMemo, useState } from "react";
import { getFileContent } from "../../../../services/filetree_api";
import MarkdownRenderer from "../../../MarkdownRenderer/MarkdownRenderer";

function buildPdfUrl(base64Content) {
    return `data:application/pdf;base64,${base64Content}`;
}

export default function ViewFileScreen({ file, onBack, onExport, onConvertToPdf }) {
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [fileData, setFileData] = useState(null);
    const [contentError, setContentError] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const isMarkdownFile = file.name.toLowerCase().endsWith(".md");

    useEffect(() => {
        loadContent(file.id);
    }, [file.id]);

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
        } catch {
            setFileData(null);
            setContentError(true);
        } finally {
            setIsLoadingContent(false);
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
        <div className="file-view-subpage">
            {isLoadingContent ? (
                <p className="loading">Loading content.....</p>
            ) : contentError || !fileData ? (
                <p className="loading">Could not load the file content.</p>
            ) : (
                <>
                    <div className="view-options">
                        <h2>Viewing file: {file.name}</h2>
                        <button className="button-back" onClick={() => onBack()}>Back</button>
                        <button className="button-export" onClick={() => onExport()}>Export</button>
                    </div>
                    <div className="view-content">
                        {isMarkdownFile && (
                            <div className="view-content-options">
                                <button className="button-pdf" onClick={handleConvertToPdf} disabled={isConverting}>
                                    {isConverting ? "Converting..." : "Convert to PDF"}
                                </button>
                            </div>
                        )}
                        <div className="view-content-display">
                            {fileData.type === "pdf" ? (
                                <iframe className="pdf-frame" src={pdfUrl} title={fileData.name} />
                            ) : (
                                <div className="rendered-content">
                                    <MarkdownRenderer content={fileData.content} />
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
