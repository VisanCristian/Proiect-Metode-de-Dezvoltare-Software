import React, { useState, useRef, useEffect } from 'react';
import './ChatbotPanel.css';

const ChatbotPanel = ({ model = 'Haiku', tokensLeft = 100 }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

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
                    <div className="chatbot-panel__header">
                        <span className="chatbot-panel__model">{model}</span>
                        <span className="chatbot-panel__tokens">{tokensLeft} tokens</span>
                    </div>
                    <div className="chatbot-panel__messages">
                        {messages.length === 0 && (
                            <p className="chatbot-panel__empty">Ask me anything about your study materials.</p>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chatbot-panel__bubble chatbot-panel__bubble--${msg.role}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="chatbot-panel__input-row">
                        <textarea
                            className="chatbot-panel__input"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={2}
                        />
                        <button
                            className="chatbot-panel__send"
                            onClick={handleSend}
                            aria-label="Send message"
                        >
                            ↑
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotPanel;
