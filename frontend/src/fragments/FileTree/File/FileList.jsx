import File from "./File.jsx";


export default function FileList({ selectedFolder, filesLoading, files, onRemove, onView, onEdit, searchFilter }) {


    return (
        <section>
            {!selectedFolder ? (
                <>
                </>
            ) : filesLoading ? (
                <p>Loading files....</p>
            ) : files.length === 0 ? (
                <p>This folder is empty....</p>
            ) : (
                <ul>
                    {files.filter((file) => file.name.toLowerCase().includes(searchFilter.toLowerCase())).map((file) => (
                        <li key={file.id}>
                            <File file={file} onRemove={onRemove} onView={onView} onEdit={onEdit} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
