async function sendRequest() {
    try {
        console.log("Sending request and waiting for the Respond to Webhook node...");
        const response = await fetch("http://localhost:5678/webhook-test/chatbot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "What are the logairithm properties?"
            })
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log("Status:", response.status);
            console.log("Response (JSON):", JSON.stringify(data, null, 2));
        } else {
            const data = await response.text();
            console.log("Status:", response.status);
            console.log("Response (Text):", data);
        }
    } catch (error) {
        console.error("Error sending request:", error.message);
    }
}

sendRequest();
