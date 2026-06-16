function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
}

async function throwApiError(response, fallbackMessage) {
    let message = fallbackMessage;

    try {
        const data = await response.json();
        message = data.message || data.detail || fallbackMessage;
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

export async function getUserActivity() {
    const response = await fetch('http://localhost:8080/api/activity/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        await throwApiError(response, 'Could not load your activity report.');
    }

    return await response.json();
}
