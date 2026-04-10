import { initialMockFileTreeDb } from "../utils/FileTree/mockFileTreeDb.js";
import { mockFileContents } from "../utils/FileTree/mockFileContents.js";

function sleep(ms = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getNextId(items) {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.id)) + 1;
}

function clone(item) {
    return structuredClone(item);
}

const mockFileTreeDb = clone(initialMockFileTreeDb);

function readStoredFileContent(file) {
    if (!file) {
        throw new Error("File not found");
    }

    if (typeof file.content === "string") {
        return file.content;
    }

    if (!file.sourceKey || !(file.sourceKey in mockFileContents)) {
        throw new Error("File content not found");
    }

    return mockFileContents[file.sourceKey];
}

function toPublicFile(file) {
    const { content, sourceKey, ...publicFile } = file;
    return publicFile;
}

export async function getUserFolders() {
    await sleep(300);
    return clone(mockFileTreeDb.folders);
}

export async function getFolderFiles(folder_id) {
    await sleep(300);

    const folderId = Number(folder_id);
    const files = mockFileTreeDb.files.filter((file) => file.folderId === folderId);

    return clone(files.map(toPublicFile));
}

export async function getFileContent(file_id) {
    await sleep(300);

    const fileId = Number(file_id);
    const file = mockFileTreeDb.files.find((item) => item.id === fileId);

    if (!file) {
        throw new Error("File not found");
    }

    return clone(readStoredFileContent(file));
}

export async function createFolder({ name }) {
    await sleep(300);

    const newFolder = {
        id: getNextId(mockFileTreeDb.folders),
        name,
    };

    mockFileTreeDb.folders.push(newFolder);
    return clone(newFolder);
}

export async function addFile({ name, type, folderId, content = "" }) {
    await sleep(300);

    const newFile = {
        id: getNextId(mockFileTreeDb.files),
        name,
        type,
        folderId: Number(folderId),
        content,
    };

    mockFileTreeDb.files.push(newFile);
    return clone(toPublicFile(newFile));
}

export async function updateFile(file_id, updates) {
    await sleep(300);

    const fileId = Number(file_id);
    const index = mockFileTreeDb.files.findIndex((file) => file.id === fileId);

    if (index === -1) {
        throw new Error("File not found");
    }

    mockFileTreeDb.files[index] = {
        ...mockFileTreeDb.files[index],
        ...updates,
    };

    return clone(toPublicFile(mockFileTreeDb.files[index]));
}

export async function saveFileChanges(file_id, content) {
    return updateFile(file_id, { content });
}

export async function exportFile(file, format) {
    await sleep(1000);

    if (!file || !file.id) {
        throw new Error("File not found");
    }

    const fileId = Number(file.id);
    const storedFile = mockFileTreeDb.files.find((item) => item.id === fileId);

    if (!storedFile) {
        throw new Error("File not found");
    }

    return {
        success: true,
        fileName: `${storedFile.name}.${format}`,
        format,
        content: clone(readStoredFileContent(storedFile)),
    };
}

export async function deleteFile(file_id) {
    await sleep(2000);

    const fileId = Number(file_id);
    const index = mockFileTreeDb.files.findIndex((file) => file.id === fileId);

    if (index === -1) {
        throw new Error("File not found");
    }

    const [deletedFile] = mockFileTreeDb.files.splice(index, 1);
    return { success: true, deletedFile: clone(deletedFile) };
}

export async function deleteFolder(folder_id) {
    await sleep(300);

    const folderId = Number(folder_id);
    const folderIndex = mockFileTreeDb.folders.findIndex((folder) => folder.id === folderId);

    if (folderIndex === -1) {
        throw new Error("Folder not found");
    }

    const [deletedFolder] = mockFileTreeDb.folders.splice(folderIndex, 1);
    mockFileTreeDb.files = mockFileTreeDb.files.filter((file) => file.folderId !== folderId);

    return { success: true, deletedFolder: clone(deletedFolder) };
}

export async function getFolderParent(folder_id) {
    return null;
}
