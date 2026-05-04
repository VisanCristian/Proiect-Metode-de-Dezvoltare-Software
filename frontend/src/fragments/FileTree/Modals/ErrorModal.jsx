import { useEffect } from "react";
import "./Modals.css";

export default function ErrorModal({ message, onClose }) {
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [message, onClose]);

    if (!message) {
        return null;
    }

    return (
        <button className="error-toast" type="button" onClick={onClose}>
            <span className="error-toast-title">Something went wrong</span>
            <span className="error-toast-message">{message}</span>
        </button>
    );
}
