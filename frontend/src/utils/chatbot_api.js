const WEBHOOK_URL = "http://localhost:5678/webhook/chatbot";
const API_URL = "http://127.0.0.1:8080";

export async function sendMessageToChatbot(message, { groupId = null, availableFiles = [], availableDecks = [] } = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found. Please log in.");
    }

    try {
        const userResponse = await fetch(`${API_URL}/api/auth/users/me/`, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!userResponse.ok) {
            throw new Error("Failed to fetch user info from token.");
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        const n8nResponse = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                user_id: userId,
                sessionId: userId,
<<<<<<< HEAD
                token: token
=======
                group_id: groupId,
                available_files: availableFiles,
                available_decks: availableDecks
>>>>>>> 94c7515c210cfa448865d6e5cf64925ac0f5c341
            })
        });

        if (!n8nResponse.ok) {
            throw new Error("Failed to send message to n8n webhook.");
        }

        const contentType = n8nResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await n8nResponse.json();
        } else {
            return await n8nResponse.text();
        }
    } catch (error) {
        console.error("Chatbot API Error:", error);
        throw error;
    }
}

export async function evaluateFlashcardAnswer(question, answer, userInput, userData) {
    const EVALUATE_URL = "http://localhost:5678/webhook-test/evaluate-flashcard";
    const token = localStorage.getItem("token");
    const payload = {
        question,
        true_answer: answer,
        user_answer: userInput,
        user: userData,
        token: token
    };

    try {
        const n8nResponse = await fetch(EVALUATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!n8nResponse.ok) {
            throw new Error("Failed to reach evaluate webhook.");
        }

        const contentType = n8nResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await n8nResponse.json();
        } else {
            const text = await n8nResponse.text();
            return { correct: text.toLowerCase().includes("true") };
        }
    } catch (error) {
        console.error("Flashcard Evaluation API Error:", error);
        throw error;
    }
}