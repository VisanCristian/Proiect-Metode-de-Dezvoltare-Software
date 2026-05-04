function FolderStruct(name, parentId, user_id) {
    return {
        name: name,
        parentId: parentId,
        user_id: user_id
    }
}

function FileStruct(name, folder, type) {
    return {
        name: name,
        folder_id: folder,
        file_type: type
    }
}
