// TODO: înlocuiește cu endpoint-ul n8n al lui Andrei
const WEBHOOK_URL = 'http://localhost:5678/webhook-test/chatbot';

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

export async function sendChatMessage(payload) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
        message: `Mock response for: "${payload?.message?.text ?? ''}"`,
    };
}
