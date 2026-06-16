const BASE_URL = 'http://127.0.0.1:8080/api/agents';

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
