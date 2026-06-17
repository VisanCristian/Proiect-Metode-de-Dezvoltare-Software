const BASE_URL = 'http://127.0.0.1:8080/api/agents';
const ACTIVITY_URL = 'http://127.0.0.1:8080/api/activity/';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } : {};
}

export async function addFlashcardPoints(points = 1) {
    await fetch(`${BASE_URL}/points/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ points }),
    });
}

export async function getTotalTokens() {
    const response = await fetch(ACTIVITY_URL, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.available_tokens ?? 0;
}
