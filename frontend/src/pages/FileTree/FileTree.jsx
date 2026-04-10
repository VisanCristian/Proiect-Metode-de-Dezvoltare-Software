import FileList from "../../fragments/FileTree/File/FileList.jsx";
import FolderList from "../../fragments/FileTree/Folder/FolderList.jsx";
import DeleteFileModal from "../../fragments/FileTree/Modals/DeleteFileModal.jsx";
import CreateFolderModal from "../../fragments/FileTree/Modals/CreateFolderModal.jsx";
import DeleteFolderModal from "../../fragments/FileTree/Modals/DeleteFolderModal.jsx";
import ExportFileModal from "../../fragments/FileTree/Modals/ExportFileModal.jsx";
import SaveChangesModal from "../../fragments/FileTree/Modals/SaveChangesModal.jsx";
import SuccessSaveModal from "../../fragments/FileTree/Modals/SuccessSaveModal.jsx";
import ViewFileScreen from "../../fragments/FileTree/Components/ViewFileScreen/ViewFileScreen.jsx";
import EditFileScreen from "../../fragments/FileTree/Components/EditFileScreen/EditFileScreen.jsx";
import { useState, useEffect } from "react";
import "./FileTree.css";
import { getUserFolders, getFolderFiles, deleteFile, createFolder, deleteFolder, exportFile, saveFileChanges } from "../../services/filetree_api.js";


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

    const [searchFilter, setSearchFilter] = useState("");

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
        try {
            setModalResponseLoading(true);
            await createFolder({ name: newFolderName });
            loadFolders();

        } catch (error) {
            console.error("Could not create a new folder:\n", error);
        } finally {
            setModalResponseLoading(false);
            setModalState({ type: null });
            setNewFolderName("");
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
        try {
            setModalResponseLoading(true);
            await deleteFile(modalState.file.id);
            setFiles((prevFiles) => prevFiles.filter((file) => file.id != modalState.file.id));
        } catch (err) {
            console.error("Could not delete file:", err);
        } finally {
            setModalState({ type: null });
            setModalResponseLoading(false);
        }
    }


    async function handleConfirmDeleteFolder() {
        if (modalState.type !== "delete-folder" || !modalState.folder) return;

        try {
            setModalResponseLoading(true);
            await deleteFolder(modalState.folder.id);
            setSelectedFolder(null);
            await loadFolders();
            setFiles([]);
            setSearchFilter("");
        } catch (err) {
            console.error("Could not delete folder\n", err);
        } finally {
            setModalState({ type: null });
            setModalResponseLoading(false);
        }
    }


    async function handleConfirmExportFile(format) {
        if (modalState.type !== "export-file" || !modalState.file) return;

        try {
            setModalResponseLoading(true);
            await exportFile(modalState.file, format);
        } catch (err) {
            console.error("Could not export file\n", err);
        } finally {
            setModalState({ type: null });
            setModalResponseLoading(false);
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
        try {
            setModalState({ type: "success-save" });
            setModalResponseLoading(true);
            await saveFileChanges(pageMode.file.id, newContent);
        } catch (err) {
            console.error("Changes couldn't be written to file:", err);
        } finally {
            setModalResponseLoading(false);
        }
    }


    async function handleConfirmSaveFile() {
        if (modalState.type !== "save-changes" || !modalState.file) return;

        try {
            setModalResponseLoading(true);
            await saveFileChanges(pageMode.file.id, modalState.changes);
        } catch (error) {
            console.error("Changes couldn't be written to file:", error);
        } finally {
            setModalResponseLoading(false);
            setModalState({ type: null });
            setPageMode({ type: "browser" });
        }
    }

    const visibleFolders = selectedFolder ? [selectedFolder] : folders;

    return (

        <>
            <div className="file-tree-main">
                <div className="file-tree-body">
                    <h1>Your personal File Storage System</h1>
                    <p className="file-tree-cite"></p>
                    {pageMode.type === "view-file" ? (
                        < ViewFileScreen
                            file={pageMode.file}
                            onBack={() => setPageMode({ type: "browser" })}
                            onExport={() => setModalState({ type: "export-file", file: pageMode.file })}
                        />
                    ) : pageMode.type === "edit-file" ? (
                        < EditFileScreen
                            file={pageMode.file}
                            onBack={handleBackFromEdit}
                            onSave={handleSaveFile}
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
                                {selectedFolder && (<input
                                    className="search-bar"
                                    type="text"
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="File Search"
                                />)}

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
