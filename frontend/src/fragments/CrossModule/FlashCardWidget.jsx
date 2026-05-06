import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CrossModuleWidgets.css";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Token ${token}` } : {};
}

export default function FlashCardWidget() {
    const navigate = useNavigate();
    const [recommendationCount, setRecommendationCount] = useState(0);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://127.0.0.1:8080/api/flashcards/recommendations/", {
                    method: "GET",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRecommendationCount(Array.isArray(data) ? data.length : 0);
                }
            } catch {
                // silently fail
            }
        }

        fetchData();
    }, []);

    return (
        <div className="cross-widget" onClick={() => navigate("/flashcards")}>
            <span className="cross-widget-icon">📚</span>
            <div className="cross-widget-info">
                <span className="cross-widget-label">Recommendations:</span>
                <span className="cross-widget-value">{recommendationCount}</span>
            </div>
        </div>
    );
}
