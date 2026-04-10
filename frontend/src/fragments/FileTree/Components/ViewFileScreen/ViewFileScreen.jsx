import "./ViewFileScreen.css";
import { useState, useEffect } from "react";
import { getFileContent } from "../../../../services/filetree_api";

export default function EditFileScreen({ file, onBack, onExport }) {
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [fileContent, setFileContent] = useState("")
    const [contentError, setContentError] = useState(false);
    useEffect(() => {
        loadContent(file.id);
    }, []);

    async function loadContent(file_id) {
        try {
            setIsLoadingContent(true);
            const data = await getFileContent(file_id);
            setFileContent(data);
        } catch (err) {
            setFileContent(null);
            setContentError(true);
        } finally {
            setIsLoadingContent(false);
        }
    }

    return (
        <>
            <div className="file-tree-page" >
                <h1>Your personal File Storage System</h1>
                <p className="file-tree-cite"></p>
            </div>
            <div className="file-view-subpage">
                {isLoadingContent ? (
                    <p className="loading"> Loading content..... </p>
                ) : (
                    <>
                        < h2 > {file.name} </h2>
                        <div className="view-options">
                            <button className="button-back" onClick={() => onBack()}> Back </button>
                            <button className="button-export" onClick={() => onExport()}> Export </button>
                        </div>
                        <div className="view-content">
                            <div className="view-content-options">
                                <button className="button-text"> Text </button>
                                <button className="button-pdf"> PDF </button>
                            </div>
                            <div className="view-content-display">
                                <pre className="content"> {fileContent} </pre>
                            </div>
                        </div>
                    </>
                )}
            </div >
        </>
    );
}
