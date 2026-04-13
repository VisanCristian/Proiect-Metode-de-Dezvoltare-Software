import "./EditFileScreen.css";

import { useEffect, useState } from "react";

import { getFileContent } from "../../../../services/filetree_api.js"

export default function EditFileScreen({ file, onBack, onSave }) {

    const [originalContent, setOriginalContent] = useState("");
    const [draftContent, setDraftContent] = useState("");

    const [isLoadingContent, setIsLoadingContent] = useState(false);

    const hasUnsavedChanges = draftContent !== originalContent;



    useEffect(() => {
        setDraftContent("");
        loadContent(file.id);
    }, [file.id]);

    async function loadContent(file_id) {
        try {
            setIsLoadingContent(true);
            const data = await getFileContent(file_id);
            setOriginalContent(data);
            setDraftContent(data);
        } catch (err) {
            console.error("Eroare la incarcarea continutului fisierului:", err);
        } finally {
            setIsLoadingContent(false);
        }
    }

    return (
        <>
            <div className="file-edit-subpage">
                {isLoadingContent ? (
                    <p className="loading"> Loading content..... </p>
                ) : (
                    <>
                        <div className="edit-options" >
                            < h2 > Editing File: {file.name} </h2>
                            <button className="button-back" onClick={() => onBack(hasUnsavedChanges, draftContent)}> Back </button>
                            <button className="button-save-changes" onClick={() => {
                                if (hasUnsavedChanges) {
                                    onSave(draftContent);
                                    setOriginalContent(draftContent);
                                }
                            }}>
                                Save Changes
                            </button>
                        </div>
                        <div className="edit-content">
                            <div className="edit-content-options">
                                <button className="button-text"> Edit </button>
                                <button className="button-pdf"> Preview </button>
                            </div>
                            <div className="edit-content-display">
                                <textarea
                                    className="file-editor"
                                    value={draftContent}
                                    onChange={(e) => setDraftContent(e.target.value)}
                                    placeholder="Write file content here....."
                                />
                            </div>
                        </div>
                    </>
                )}
            </div >
        </>

    );
}
