import { useNavigate } from "react-router-dom";
import "./CrossModuleWidgets.css";

export default function FileTreeWidget() {
    const navigate = useNavigate();

    return (
        <div className="cross-widget" onClick={() => navigate("/filetree")}>
            <span className="cross-widget-icon">📁</span>
            <div className="cross-widget-info">
                <span className="cross-widget-value">Your Files</span>
            </div>
        </div>
    );
}
