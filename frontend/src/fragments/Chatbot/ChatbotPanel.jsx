import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatbotPanel.css';
import { buildMessageObject, buildContextObject, buildSettingsObject, buildChatPayload } from './format';
import { sendChatMessage } from '../../services/chatbot_api';

const MAX_MESSAGE_LENGTH = 1000;

const ChatbotPanel = ({ model = 'Auto', tokensLeft = 0, scope = 'personal', groupId = null, availableFiles = [], availableDecks = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [panelWidth, setPanelWidth] = useState(400);
    const bottomRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragStartWidth = useRef(0);

    const onDragStart = useCallback((e) => {
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragStartWidth.current = panelWidth;
        document.body.style.userSelect = 'none';
    }, [panelWidth]);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current) return;
            const delta = dragStartX.current - e.clientX;
            const next = Math.min(600, Math.max(240, dragStartWidth.current + delta));
            setPanelWidth(next);
        };
        const onMouseUp = () => {
            isDragging.current = false;
            document.body.style.userSelect = '';
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

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
        <div
            className={`chatbot-panel ${isOpen ? 'chatbot-panel--open' : 'chatbot-panel--closed'}`}
            style={isOpen ? { width: `${panelWidth}px` } : undefined}
        >
            {isOpen && (
                <div className="chatbot-panel__resize-handle" onMouseDown={onDragStart} />
            )}
            <button
                className="chatbot-panel__toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
                title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
                {isOpen ? '›' : (
                    <span className="chatbot-panel__toggle-label">
                        <span className="chatbot-panel__toggle-emoji">🎓</span>
                        <span className="chatbot-panel__toggle-icon">Assistant</span>
                        <span className="chatbot-panel__toggle-icon">Study</span>
                        <span className="chatbot-panel__toggle-icon">Personal</span>
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
