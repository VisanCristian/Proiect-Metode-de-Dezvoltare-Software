import React, { useState, useRef, useEffect } from 'react';
import './ChatbotPanel.css';
import { buildMessageObject, buildContextObject, buildSettingsObject, buildChatPayload } from './format';
import { sendChatMessage } from '../../services/chatbot_api';

const MAX_MESSAGE_LENGTH = 1000;

const ChatbotPanel = ({ model = 'Haiku', tokensLeft = 100, scope = 'personal', groupId = null, availableFiles = [], availableDecks = [] }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const isTooLong = input.length > MAX_MESSAGE_LENGTH;

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading || isTooLong) return;

        const userMessage = buildMessageObject(text, 'user');
        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
        setIsLoading(true);

        try {
            const context = buildContextObject({ scope, userId: null, groupId, availableFiles, availableDecks });
            const settings = buildSettingsObject({ model, isGroup: scope === 'group' });
            const payload = buildChatPayload(userMessage, context, settings);

            const response = await sendChatMessage(payload);
            const replyText = response?.message ?? 'No response received.';
            setMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
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
                title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
                {isOpen ? '›' : (
                    <span className="chatbot-panel__toggle-label">
                        <span className="chatbot-panel__toggle-icon">AI</span>
                        <span className="chatbot-panel__toggle-arrow">‹</span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="chatbot-panel__content">
                    <div className="chatbot-panel__header">
                        <div className="chatbot-panel__header-left">
                            <span className="chatbot-panel__title">Study Assistant</span>
                            <span className="chatbot-panel__model">{model}</span>
                        </div>
                        <span className="chatbot-panel__tokens">{tokensLeft} tokens</span>
                    </div>

                    <div className="chatbot-panel__messages">
                        {messages.length === 0 && (
                            <div className="chatbot-panel__empty">
                                <div className="chatbot-panel__empty-icon">💬</div>
                                <p className="chatbot-panel__empty-title">Study Assistant</p>
                                <p className="chatbot-panel__empty-hint">Ask me anything about your files or flashcard decks.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chatbot-panel__bubble chatbot-panel__bubble--${msg.role}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-panel__bubble chatbot-panel__bubble--assistant chatbot-panel__thinking">
                                Thinking...
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {isTooLong && (
                        <p className="chatbot-panel__char-warning">
                            Message too long ({input.length}/{MAX_MESSAGE_LENGTH} characters).
                        </p>
                    )}

                    <div className="chatbot-panel__input-row">
                        <textarea
                            className="chatbot-panel__input"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-panel__send"
                            onClick={handleSend}
                            aria-label="Send message"
                            disabled={isLoading || isTooLong}
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
