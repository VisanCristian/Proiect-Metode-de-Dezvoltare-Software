import { useNavigate } from "react-router-dom";
import { usePomodoroContext } from "../../context/PomodoroContext";
import "./CrossModuleWidgets.css";

function formatTime(seconds) {
    if (!seconds && seconds !== 0) return "00:00";
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
}

export default function PomodoroWidget() {
    const navigate = useNavigate();
    const { timer } = usePomodoroContext();

    return (
        <div className="cross-widget" onClick={() => navigate("/pomodoro")}>
            <span className="cross-widget-icon">🍅</span>
            <div className="cross-widget-info">
                <span className="cross-widget-label">Timer:</span>
                <span className="cross-widget-value">{formatTime(timer.timeLeft)}</span>
            </div>
            <div className="cross-widget-divider" />
            <div className="cross-widget-info">
                <span className="cross-widget-label">Cycles:</span>
                <span className="cross-widget-value">{timer.completedCycle}</span>
            </div>
        </div>
    );
}
