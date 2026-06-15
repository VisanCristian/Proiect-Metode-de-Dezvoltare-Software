// API Service for Group functionality

const BASE_URL = "http://127.0.0.1:8080/api/groups";

/**
 * Helper function to handle fetch responses and extract data or throw an error.
 */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    
    // We try to parse JSON, if it fails, we fall back to a generic object
    let data = {};
    try {
        data = await response.json();
    } catch (e) {
        // No JSON body
    }

    if (!response.ok) {
        throw { status: response.status, ...data };
    }
    
    return { status: response.status, data };
}

/**
 * Returns the groups the current user belongs to.
 */
export async function getUserGroups() {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/list`);
        // The backend returns { contents: [ ... ] }
        return response.data.contents || [];
    } catch (err) {
        console.error("Failed to load user groups", err);
        return [];
    }
}

/**
 * Creates a new group and returns it.
 */
export async function create_new_group(name) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/create`, {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        return { status: 201, group: response.data };
    } catch (err) {
        console.error("Failed to create group", err);
        return { status: err.status || 500, message: err.message || "Error creating group" };
    }
}

/**
 * Joins an existing group by its unique token.
 */
export async function join_group(token) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/join`, {
            method: "POST",
            body: JSON.stringify({ token }),
        });
        return { status: 200, group: response.data };
    } catch (err) {
        console.error("Failed to join group", err);
        return { status: err.status || 500, message: err.message || "Error joining group" };
    }
}

/**
 * Leaves a group. Removes the current user from the group's member list,
 * or deletes the group entirely if the user is the owner.
 */
export async function leave_group(groupId) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/leave?id=${groupId}`, {
            method: "DELETE",
        });
        return { status: 200, message: "Successfully left the group." };
    } catch (err) {
        console.error("Failed to leave group", err);
        return { status: err.status || 500, message: err.message || "Error leaving group" };
    }
}

export async function getGroupDetails(groupId) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/detail/${groupId}`);
        return { status: 200, group: response.data };
    } catch (err) {
        console.error("Failed to fetch group details", err);
        return { status: err.status || 500, message: err.message || "Error fetching group details" };
    }
}

export async function shareDeckToGroup(groupId, deckId) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/${groupId}/share_deck`, {
            method: "POST",
            body: JSON.stringify({ deck_id: deckId }),
        });
        return { status: 201, message: "Deck shared successfully" };
    } catch (err) {
        console.error("Failed to share deck", err);
        return { status: err.status || 500, message: err.message || "Error sharing deck" };
    }
}

export async function shareFileToGroup(groupId, fileId) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/${groupId}/share_file`, {
            method: "POST",
            body: JSON.stringify({ file_id: fileId }),
        });
        return { status: 201, message: "File shared successfully" };
    } catch (err) {
        console.error("Failed to share file", err);
        return { status: err.status || 500, message: err.message || "Error sharing file" };
    }
}

export async function unshareDeckFromGroup(groupId, deckId) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/${groupId}/unshare_deck?deck_id=${deckId}`, {
            method: "DELETE",
        });
        return { status: 200, message: "Deck unshared successfully" };
    } catch (err) {
        console.error("Failed to unshare deck", err);
        return { status: err.status || 500, message: err.message || "Error unsharing deck" };
    }
}

export async function unshareFileFromGroup(groupId, fileId) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/${groupId}/unshare_file?file_id=${fileId}`, {
            method: "DELETE",
        });
        return { status: 200, message: "File unshared successfully" };
    } catch (err) {
        console.error("Failed to unshare file", err);
        return { status: err.status || 500, message: err.message || "Error unsharing file" };
    }
}
