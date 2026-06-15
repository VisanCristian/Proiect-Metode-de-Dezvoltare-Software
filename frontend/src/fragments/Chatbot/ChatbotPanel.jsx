import React, { useState } from 'react';
import './ChatbotPanel.css';

const ChatbotPanel = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`chatbot-panel ${isOpen ? 'chatbot-panel--open' : 'chatbot-panel--closed'}`}>
            <button
                className="chatbot-panel__toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
            >
                {isOpen ? '›' : '‹'}
            </button>

            {isOpen && (
                <div className="chatbot-panel__content">
                    <p className="chatbot-panel__placeholder">Chatbot</p>
                </div>
            )}
        </div>
    );
};

export default ChatbotPanel;
