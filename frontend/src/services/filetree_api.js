function normalizeErrorMessage(value) {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }

    if (Array.isArray(value)) {
        const nestedMessages = value
            .map((item) => normalizeErrorMessage(item))
            .filter(Boolean);

        if (nestedMessages.length > 0) {
            return nestedMessages.join(" ");
        }
    }

    if (value && typeof value === "object") {
        const nestedMessages = Object.values(value)
            .map((item) => normalizeErrorMessage(item))
            .filter(Boolean);

        if (nestedMessages.length > 0) {
            return nestedMessages.join(" ");
        }
    }

    return "";
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
}

async function throwApiError(response, fallbackMessage) {
    let message = fallbackMessage;

    try {
        const data = await response.json();
        message = data.message || normalizeErrorMessage(data.errors) || data.detail || fallbackMessage;
    } catch {
        try {
            const text = await response.text();
            if (text.trim()) {
                message = text.trim();
            }
        } catch {
            message = fallbackMessage;
        }
    }

    throw new Error(message);
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function base64ToUint8Array(base64Content) {
    const binaryString = window.atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);

    for (let index = 0; index < binaryString.length; index += 1) {
        bytes[index] = binaryString.charCodeAt(index);
    }

    return bytes;
}

function isMarkdownFile(fileName) {
    return typeof fileName === "string" && fileName.toLowerCase().endsWith(".md");
}

export async function getUserFolders() {
    const response = await fetch("http://localhost:8080/api/filesystem/folders", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, "Could not load your folders.");
    }

    const data = await response.json();
    return data.contents;
}

export async function getFolderFiles(folder_id) {
    const response = await fetch(`http://localhost:8080/api/filesystem/folders/list?id=${folder_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, "Could not load the files from this folder.");
    }

    const data = await response.json();
    return data.contents;
}

export async function getFileContent(file_id) {
    const response = await fetch(`http://localhost:8080/api/filesystem/files/content?id=${file_id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, "Could not load the file content.");
    }

    return await response.json();
}

export async function createFolder({ name }) {
    const response = await fetch("http://localhost:8080/api/filesystem/folders/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        await throwApiError(response, "Could not create the folder.");
    }

    const data = await response.json();
    return { id: data.id, name };
}

export async function addFile({ file, folderId }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId);

    const response = await fetch("http://localhost:8080/api/filesystem/files/add", {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
        },
        body: formData,
    });

    if (!response.ok) {
        await throwApiError(response, "Could not add the selected file.");
    }

    return await response.json();
}

export async function saveFileChanges(file_id, content) {
    const response = await fetch("http://localhost:8080/api/filesystem/files/update", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ id: file_id, content }),
    });

    if (!response.ok) {
        await throwApiError(response, "Could not save the file changes.");
    }

    return await response.json();
}

export async function exportFile(file) {
    const response = await fetch(`http://localhost:8080/api/filesystem/files/export?id=${file.id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, "Could not export this file.");
    }

    const data = await response.json();

    if (data.type === "pdf") {
        const bytes = base64ToUint8Array(data.content);
        downloadBlob(new Blob([bytes], { type: "application/pdf" }), data.name);
        return data;
    }

    downloadBlob(new Blob([data.content], { type: "text/plain;charset=utf-8" }), data.name);
    return data;
}

export async function convertMarkdownFileToPdf(file) {
    if (!file?.id) {
        throw new Error("File not found.");
    }

    if (!isMarkdownFile(file.name)) {
        throw new Error("Only markdown files can be converted to PDF.");
    }

    const response = await fetch("http://localhost:8080/api/filesystem/files/convert-pdf", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ id: file.id }),
    });

    if (!response.ok) {
        await throwApiError(response, "Could not convert the markdown file to PDF.");
    }

    return await response.json();
}

export async function deleteFile(file_id) {
    const response = await fetch(`http://localhost:8080/api/filesystem/files/remove?id=${file_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, "Could not delete the selected file.");
    }

    return true;
}

export async function deleteFolder(folder_id) {
    const response = await fetch(`http://localhost:8080/api/filesystem/folders/remove?id=${folder_id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, "Could not delete the selected folder.");
    }

    return true;
}

export async function getFolderParent() {
    return null;
}

