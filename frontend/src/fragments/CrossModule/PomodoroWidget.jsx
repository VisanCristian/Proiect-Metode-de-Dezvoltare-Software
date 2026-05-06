import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CrossModuleWidgets.css";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { "Authorization": `Token ${token}` } : {};
}

export default function PomodoroWidget() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://localhost:8080/api/pomodoro/sessions/current/", {
                    method: "GET",
                    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                });

                if (response.ok) {
                    setSession(await response.json());
                }
            } catch {
                // silently fail
            }
        }

        fetchData();
    }, []);

    function formatTime(seconds) {
        if (!seconds && seconds !== 0) return "00:00";
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    }

    const totalFocus = session?.total_focus_time ?? 0;
    const completedPomodoros = session?.completed_pomodoros ?? 0;

    return (
        <div className="cross-widget" onClick={() => navigate("/pomodoro")}>
            <span className="cross-widget-icon">🍅</span>
            <div className="cross-widget-info">
                <span className="cross-widget-label">Timer:</span>
                <span className="cross-widget-value">{formatTime(totalFocus)}</span>
            </div>
            <div className="cross-widget-divider" />
            <div className="cross-widget-info">
                <span className="cross-widget-label">Tasks Completed:</span>
                <span className="cross-widget-value">{completedPomodoros}</span>
            </div>
        </div>
    );
}
