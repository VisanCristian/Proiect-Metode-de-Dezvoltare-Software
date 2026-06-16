const API_URL = 'http://127.0.0.1:8080/api/agents/memory/';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } : {};
}

export async function incrementFlashcardPoints() {
    const headers = getAuthHeaders();

    const getRes = await fetch(API_URL, { headers });
    if (!getRes.ok) return;
    const data = await getRes.json();

    await fetch(API_URL, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ flashcard_points: (data.flashcard_points || 0) + 1 }),
    });
}
