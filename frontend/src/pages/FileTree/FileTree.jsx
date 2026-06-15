import FileList from "../../fragments/FileTree/File/FileList.jsx";
import FolderList from "../../fragments/FileTree/Folder/FolderList.jsx";
import Modal from "../../fragments/Modal.jsx";
import ErrorModal from "../../fragments/FileTree/Modals/ErrorModal.jsx";
import ViewFileScreen from "../../fragments/FileTree/Components/ViewFileScreen/ViewFileScreen.jsx";
import EditFileScreen from "../../fragments/FileTree/Components/EditFileScreen/EditFileScreen.jsx";
import { useState, useEffect } from "react";
import "./FileTree.css";
import { getUserFolders, getFolderFiles, deleteFile, createFolder, deleteFolder, exportFile, saveFileChanges, addFile, convertMarkdownFileToPdf } from "../../services/filetree_api.js";
import PomodoroWidget from "../../fragments/CrossModule/PomodoroWidget.jsx";
import FlashCardWidget from "../../fragments/CrossModule/FlashCardWidget.jsx";


export default function FileTree() {
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [files, setFiles] = useState([]);

    const [foldersLoading, setFoldersLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(false);

    const [modalState, setModalState] = useState({ type: null });
    const [modalResponseLoading, setModalResponseLoading] = useState(false);
    const [pageMode, setPageMode] = useState({ type: "browser" });

    const [newFolderName, setNewFolderName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchFilter, setSearchFilter] = useState("");

    const [exportFormat, setExportFormat] = useState("text");

    function showError(message) {
        if (!message) return;
        setErrorMessage("");
        window.setTimeout(() => {
            setErrorMessage(message);
        }, 0);
    }

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        document.body.classList.add("filetree-body");

        return () => {
            document.body.classList.remove("filetree-body");
        }
    }, []);


    async function loadFolders() {
        try {
            setFoldersLoading(true);
            const data = await getUserFolders();
            setFolders(data);
        } catch (err) {
            console.error("Could not load folders:", err);
            showError(err.message || "Could not load your folders.");
        } finally {
            setFoldersLoading(false);
        }
    }


    function handleCancel() {
        if (modalState.type === "save-changes") {
            setPageMode({ type: "browser" });
        }
        setModalState({ type: null });
    }


    async function handleOpenFolder(folder) {
        try {
            setSelectedFolder(folder);
            setFilesLoading(true);
            setSearchFilter("");

            const data = await getFolderFiles(folder.id);
            setFiles(data);
        } catch (err) {
            console.error("Error loading files from folder:", err);
            showError(err.message || "Could not load the files from this folder.");
        } finally {
            setFilesLoading(false);
        }
    }


    function handleBackToFolders() {
        setSelectedFolder(null);
        setFiles([]);
    }


    function handleViewFile(file) {
        setPageMode({ type: "view-file", file });
    }


    function handleEditFile(file) {
        setPageMode({ type: "edit-file", file })
    }

    async function handleCreateFolder() {
        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);
            await createFolder({ name: newFolderName });
            await loadFolders();
            wasSuccessful = true;

        } catch (error) {
            console.error("Could not create a new folder:\n", error);
            showError(error.message || "Could not create the folder.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: null });
                setNewFolderName("");
            }
        }
    }

    async function handleConfirmAddFile() {
        if (!selectedFile) {
            showError("Please choose a file before confirming.");
            return;
        }

        if (!selectedFolder) {
            showError("Please select a folder before adding a file.");
            return;
        }

        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);

            await addFile({ file: selectedFile, folderId: selectedFolder.id });

            const data = await getFolderFiles(selectedFolder.id);
            setFiles(data);
            wasSuccessful = true;
        } catch (error) {
            console.error("Could not add file:", error);
            showError(error.message || "Could not add the selected file.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: null });
                setSelectedFile(null);
            }
        }
    }


    function handleAskDeleteFile(file) {
        setModalResponseLoading(false);
        setModalState({ type: "delete-file", file });
    }


    function handleAskDeleteFolder(folder) {
        setModalResponseLoading(false);
        setModalState({ type: "delete-folder", folder })
    }


    async function handleConfirmDeleteFile() {
        if (modalState.type !== "delete-file" || !modalState.file) return;

        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);
            await deleteFile(modalState.file.id);
            setFiles((prevFiles) => prevFiles.filter((file) => file.id != modalState.file.id));
            wasSuccessful = true;
        } catch (err) {
            console.error("Could not delete file:", err);
            showError(err.message || "Could not delete the selected file.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: null });
            }
        }
    }


    async function handleConfirmDeleteFolder() {
        if (modalState.type !== "delete-folder" || !modalState.folder) return;

        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);
            await deleteFolder(modalState.folder.id);
            setSelectedFolder(null);
            await loadFolders();
            setFiles([]);
            setSearchFilter("");
            wasSuccessful = true;
        } catch (err) {
            console.error("Could not delete folder\n", err);
            showError(err.message || "Could not delete the selected folder.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: null });
            }
        }
    }


    async function handleConfirmExportFile(format) {
        if (modalState.type !== "export-file" || !modalState.file) return;

        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);
            await exportFile(modalState.file, format);
            wasSuccessful = true;
        } catch (err) {
            console.error("Could not export file\n", err);
            showError(err.message || "Could not export this file.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: null });
            }
        }
    }


    async function handleConvertFileToPdf(file) {
        try {
            const newFile = await convertMarkdownFileToPdf(file);

            if (selectedFolder) {
                const data = await getFolderFiles(selectedFolder.id);
                setFiles(data);
            }

            setPageMode({ type: "view-file", file: newFile });
        } catch (error) {
            console.error("Could not convert markdown file to PDF:", error);
            showError(error.message || "Could not convert the markdown file to PDF.");
        }
    }


    function handleBackFromEdit(isChangingContent, draftContent) {
        if (isChangingContent === false) {
            setPageMode({ type: "browser" });
            return;
        }
        setModalState({ type: "save-changes", file: pageMode.file, changes: draftContent })
    }


    async function handleSaveFile(newContent) {
        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);
            await saveFileChanges(pageMode.file.id, newContent);
            wasSuccessful = true;
        } catch (err) {
            console.error("Changes couldn't be written to file:", err);
            showError(err.message || "Could not save the file changes.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: "success-save" });
            }
        }

        return wasSuccessful;
    }


    async function handleConfirmSaveFile() {
        if (modalState.type !== "save-changes" || !modalState.file) return;

        let wasSuccessful = false;

        try {
            setModalResponseLoading(true);
            await saveFileChanges(pageMode.file.id, modalState.changes);
            wasSuccessful = true;
        } catch (error) {
            console.error("Changes couldn't be written to file:", error);
            showError(error.message || "Could not save the file changes.");
        } finally {
            setModalResponseLoading(false);
            if (wasSuccessful) {
                setModalState({ type: null });
                setPageMode({ type: "browser" });
            }
        }
    }

    const visibleFolders = selectedFolder ? [selectedFolder] : folders;

    return (

        <>
            <ErrorModal message={errorMessage} onClose={() => setErrorMessage("")} />
            <div className="file-tree-main">
                <div className="file-tree-body">
                    <h1>Your personal File Storage System</h1>
                    <p className="file-tree-cite"></p>
                    <div className="cross-widget-bar">
                        <PomodoroWidget />
                        <FlashCardWidget />
                    </div>
                    {pageMode.type === "view-file" ? (
                        < ViewFileScreen
                            file={pageMode.file}
                            onBack={() => setPageMode({ type: "browser" })}
                            onExport={() => setModalState({ type: "export-file", file: pageMode.file })}
                            onConvertToPdf={handleConvertFileToPdf}
                        />
                    ) : pageMode.type === "edit-file" ? (
                        < EditFileScreen
                            file={pageMode.file}
                            onBack={handleBackFromEdit}
                            onSave={handleSaveFile}
                            onConvertToPdf={handleConvertFileToPdf}
                        />
                    ) : pageMode.type === "browser" ? (
                        <div className="file-tree-page" >
                            <div className="folder-tree">
                                <FolderList
                                    selectedFolder={selectedFolder}
                                    foldersLoading={foldersLoading}
                                    folders={folders}
                                    visibleFolders={visibleFolders}
                                    onOpenFolder={handleOpenFolder}
                                    onOpenCreateFolder={() => setModalState({ type: "create-folder" })}
                                    onBackToFolders={handleBackToFolders}
                                    onOpenRemoveFolder={() => handleAskDeleteFolder(selectedFolder)}
                                />
                            </div>
                            <div className="file-tree">
                                {selectedFolder && (
                                    <>
                                        <div className="file-tree-toolbar">
                                            <h2> Files </h2>
                                            <button className="button-add" onClick={() => setModalState({ type: "add-file" })}>
                                                Add File
                                            </button>
                                            <input
                                                className="search-bar"
                                                type="text"
                                                onChange={(e) => setSearchFilter(e.target.value)}
                                                placeholder="File Search"
                                            />
                                        </div>
                                    </>)}

                                <FileList
                                    selectedFolder={selectedFolder}
                                    filesLoading={filesLoading}
                                    files={files}
                                    onRemove={handleAskDeleteFile}
                                    onView={handleViewFile}
                                    onEdit={handleEditFile}
                                    searchFilter={searchFilter}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div >

            {modalState.type === "delete-file" && modalState.file && (
                <Modal
                    message={`Are you sure you want to delete ${modalState.file.name}?`}
                    loadingMessage="Removing File...."
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Confirm", onClick: handleConfirmDeleteFile },
                        { label: "Cancel", onClick: handleCancel, variant: "cancel" },
                    ]}
                />
            )}

            {modalState.type === "create-folder" && (
                <Modal
                    title="Add a new Folder"
                    loadingMessage="Creating the new folder...."
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Confirm", onClick: handleCreateFolder, disabled: !newFolderName.trim() },
                        { label: "Cancel", onClick: handleCancel, variant: "cancel" },
                    ]}
                >
                    <input
                        className="text-input"
                        type="text"
                        value={newFolderName}
                        onChange={(event) => setNewFolderName(event.target.value)}
                        placeholder="New Folder Name"
                    />
                </Modal>
            )}

            {modalState.type === "add-file" && (
                <Modal
                    title="Add a new File"
                    loadingMessage="Adding the new file...."
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Confirm", onClick: handleConfirmAddFile, disabled: !selectedFile },
                        { label: "Cancel", onClick: handleCancel, variant: "cancel" },
                    ]}
                >
                    <div className="file-upload-area">
                        <label className="file-upload-button" htmlFor="add-file-input">
                            Choose File
                        </label>
                        <input
                            id="add-file-input"
                            className="file-upload-input"
                            type="file"
                            onChange={(event) => setSelectedFile(event.target.files[0])}
                        />
                        <p className="selected-file-name">
                            {selectedFile ? `Selected file: ${selectedFile.name}` : "No file selected"}
                        </p>
                    </div>
                </Modal>
            )}

            {modalState.type === "delete-folder" && (
                <Modal
                    message={`Are you sure you want to delete ${modalState.folder?.name ?? "this folder"}? The following files will also be deleted:`}
                    loadingMessage="Deleting current folder..."
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Confirm", onClick: handleConfirmDeleteFolder },
                        { label: "Cancel", onClick: handleCancel, variant: "cancel" },
                    ]}
                >
                    {files.map((file) => (
                        <p key={file.id}> {file.name} </p>
                    ))}
                </Modal>
            )}

            {modalState.type === "export-file" && (
                <Modal
                    title="Export File"
                    loadingMessage="Exporting file...."
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Cancel", onClick: handleCancel, variant: "cancel" },
                        { label: "Confirm", onClick: () => handleConfirmExportFile(exportFormat) },
                    ]}
                >
                    <div className="export-select-group">
                        <label className="export-select-label" htmlFor="export-type">Export type</label>
                        <select
                            id="export-type"
                            className="select-export-type"
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                        >
                            {modalState.file?.type === "pdf" ? (
                                <option value="pdf">PDF</option>
                            ) : (
                                <option value="text">Text</option>
                            )}
                        </select>
                    </div>
                </Modal>
            )}

            {modalState.type === "save-changes" && (
                <Modal
                    message="There are unsaved changes. Do you want to save them?"
                    loadingMessage={`Writing changes to file ${modalState.file?.name}...`}
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Don't Save", onClick: handleCancel, variant: "cancel" },
                        { label: "Save", onClick: handleConfirmSaveFile },
                    ]}
                />
            )}

            {modalState.type === "success-save" && (
                <Modal
                    message="File has been saved successfully"
                    loadingMessage="Saving file...."
                    isLoading={modalResponseLoading}
                    buttons={[
                        { label: "Ok", onClick: () => setModalState({ type: null }) },
                    ]}
                />
            )}
        </>
    );
}
