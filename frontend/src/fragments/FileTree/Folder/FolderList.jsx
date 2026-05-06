import Folder from "./Folder.jsx";

export default function FolderList({
    selectedFolder,
    foldersLoading,
    folders,
    visibleFolders,
    onOpenFolder,
    onOpenCreateFolder,
    onBackToFolders,
    onOpenRemoveFolder,
}) {
    return (
        <section>
            {!selectedFolder ? (
                <h2>Folders</h2>
            ) : null}
            <div className="folder-layout">
                <div className="folder-options">
                    {!selectedFolder ? (
                        <>
                            <button className="button-add" onClick={onOpenCreateFolder}>Create Folder</button>
                        </>
                    ) : (
                        <>

                            <button className="button-back" onClick={onBackToFolders}>Back</button>
                            <button className="button-remove" onClick={onOpenRemoveFolder}>Remove Current Folder</button>
                        </>
                    )}
                </div>


                {foldersLoading ? (
                    <p>Loading folders...</p>
                ) : folders.length === 0 ? (
                    <p>You currently have no folders created</p>
                ) : (
                    <ul className="layout-folders">
                        {visibleFolders.map((folder) => (
                            <li key={folder.id}>
                                <Folder folder={folder} onClick={() => onOpenFolder(folder)} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
