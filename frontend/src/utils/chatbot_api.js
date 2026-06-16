const WEBHOOK_URL = "http://localhost:5678/webhook-test/chatbot";
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
                token: token,
                group_id: groupId,
                available_files: availableFiles,
                available_decks: availableDecks
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

export async function evaluateFlashcardAnswer(question, answer, userInput, userData, flashcardId) {
    const EVALUATE_URL = "http://localhost:5678/webhook-test/chatbot";
    const token = localStorage.getItem("token");
    const payload = {
        message: `Please evaluate this flashcard answer. Question: "${question}". Correct Answer: "${answer}". User's Answer: "${userInput}". If the user's answer is correct, use the award_flashcard_points tool to award a minimum of 500 points (make sure to pass flashcard_id: ${flashcardId}). Reply with JSON containing "correct": true/false and "message": "your explanation, including whether they received points, or if the flashcard was already answered today".`,
        question,
        true_answer: answer,
        user_answer: userInput,
        user: userData,
        token: token,
        flashcard_id: flashcardId
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
        let dataStr = "";
        let isRawJson = false;

        if (contentType && contentType.includes("application/json")) {
            const rawJson = await n8nResponse.json();
            
            // Check if it's ALREADY the exact format we asked for
            if (rawJson.correct !== undefined) {
                return { 
                    correct: rawJson.correct === true || String(rawJson.correct).toLowerCase() === "true",
                    message: rawJson.message || JSON.stringify(rawJson)
                };
            }
            
            // Otherwise, n8n often nests the AI response string in 'output' or 'text'
            dataStr = rawJson.output || rawJson.text || rawJson.response || rawJson.message || JSON.stringify(rawJson);
        } else {
            dataStr = await n8nResponse.text();
        }

        // Attempt to parse dataStr as JSON if it's a string containing JSON
        try {
            // Strip markdown code fences if present
            const cleanStr = dataStr.replace(/^```json/i, "").replace(/```$/i, "").trim();
            const parsed = JSON.parse(cleanStr);
            return {
                correct: parsed.correct === true || String(parsed.correct).toLowerCase() === "true",
                message: parsed.message || dataStr
            };
        } catch {
            // Fallback: it's not valid JSON, so search for true/false in the string
            const isCorrect = dataStr.toLowerCase().includes("true") || dataStr.toLowerCase().includes('"correct": true');
            return { correct: isCorrect, message: dataStr };
        }
    } catch (error) {
        console.error("Flashcard Evaluation API Error:", error);
        throw error;
    }
}