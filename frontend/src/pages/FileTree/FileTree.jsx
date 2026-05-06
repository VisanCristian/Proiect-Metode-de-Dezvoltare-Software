import FileList from "../../fragments/FileTree/File/FileList.jsx";
import FolderList from "../../fragments/FileTree/Folder/FolderList.jsx";
import DeleteFileModal from "../../fragments/FileTree/Modals/DeleteFileModal.jsx";
import CreateFolderModal from "../../fragments/FileTree/Modals/CreateFolderModal.jsx";
import DeleteFolderModal from "../../fragments/FileTree/Modals/DeleteFolderModal.jsx";
import AddFileModal from "../../fragments/FileTree/Modals/AddFileModal.jsx";
import ExportFileModal from "../../fragments/FileTree/Modals/ExportFileModal.jsx";
import SaveChangesModal from "../../fragments/FileTree/Modals/SaveChangesModal.jsx";
import SuccessSaveModal from "../../fragments/FileTree/Modals/SuccessSaveModal.jsx";
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

            {
                modalState.type === "delete-file" && (
                    <DeleteFileModal
                        file={modalState.file}
                        isLoading={modalResponseLoading}
                        onConfirm={handleConfirmDeleteFile}
                        onCancel={handleCancel}
                    />
                )
            }

            {
                modalState.type === "create-folder" && (
                    <CreateFolderModal
                        folderName={newFolderName}
                        isLoading={modalResponseLoading}
                        onFolderNameChange={setNewFolderName}
                        onConfirm={handleCreateFolder}
                        onCancel={handleCancel}
                    />
                )
            }

            {
                modalState.type === "add-file" && (
                    <AddFileModal
                        file={selectedFile}
                        isLoading={modalResponseLoading}
                        onFileChange={setSelectedFile}
                        onConfirm={handleConfirmAddFile}
                        onCancel={handleCancel}
                    />
                )
            }

            {
                modalState.type === "delete-folder" && (
                    <DeleteFolderModal
                        folder={modalState.folder}
                        isLoading={modalResponseLoading}
                        files={files}
                        onConfirm={handleConfirmDeleteFolder}
                        onCancel={handleCancel}
                    />
                )
            }

            {
                modalState.type === "export-file" && (
                    <ExportFileModal
                        file={modalState.file}
                        isLoading={modalResponseLoading}
                        onConfirm={handleConfirmExportFile}
                        onCancel={handleCancel}
                    />
                )
            }

            {
                modalState.type === "save-changes" && (
                    <SaveChangesModal
                        file={modalState.file}
                        isLoading={modalResponseLoading}
                        onConfirm={handleConfirmSaveFile}
                        onCancel={handleCancel}
                    />
                )
            }

            {
                modalState.type === "success-save" && (
                    <SuccessSaveModal
                        isLoading={modalResponseLoading}
                        onConfirm={() => setModalState({ type: null })}
                    />
                )
            }
        </>
    );
}
