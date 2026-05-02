import { useState } from 'react'
import { ClockIcon, ChevronIcon, TrashIcon, CheckIcon } from '../Icons/Icons'

function SessionHistory({ sessions, onClearAll }) {
    const [isOpen, setIsOpen] = useState(false)
    const [expandedId, setExpandedId] = useState(null)

    if (sessions.length === 0) return null

    const sorted = [...sessions].reverse()

    const formatDate = (ts) =>
        new Date(ts).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
    const formatTime = (ts) =>
        new Date(ts).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    const formatDuration = (sec) => {
        const m = Math.floor(sec / 60)
        return m > 0 ? `${m} min` : `${sec}s`
    }

    const totalPomodoros = sessions.reduce((s, x) => s + x.completedPomodoros, 0)
    const totalFocus = sessions.reduce((s, x) => s + x.totalFocusTime, 0)

    return (
        <div className="history">
            <button onClick={() => setIsOpen(!isOpen)} className="history-toggle">
                <span className="history-toggle-title">
                    <ClockIcon stroke="var(--accent)" />
                    Istoric sesiuni
                    <span className="history-count">{sessions.length}</span>
                </span>
                <ChevronIcon open={isOpen} stroke="var(--text)" />
            </button>

            {isOpen && (
                <div className="history-body slide-down">
                    <div className="history-totals">
                        <span>Total: <strong>{totalPomodoros}</strong> pomodoros</span>
                        <span><strong>{formatDuration(totalFocus)}</strong> focus</span>
                    </div>

                    <div className="history-list">
                        {sorted.map((session) => {
                            const id = session.startTime
                            const isExpanded = expandedId === id
                            const doneTasks = session.tasks.filter(t => t.completed).length

                            return (
                                <div className="history-session" key={id}>
                                    <button onClick={() => setExpandedId(isExpanded ? null : id)}
                                        className="history-session-btn">
                                        <span className="history-date">{formatDate(session.startTime)}</span>
                                        <span className="history-time">
                                            {formatTime(session.startTime)} → {formatTime(session.endTime)}
                                        </span>
                                        <span className="history-pomodoros">{session.completedPomodoros}</span>
                                        <ChevronIcon size={12} open={isExpanded} stroke="var(--text)" />
                                    </button>

                                    {isExpanded && (
                                        <div className="history-detail">
                                            <div className="history-detail-grid">
                                                <div>
                                                    <div className="stat-label">Focus</div>
                                                    <div className="stat-value">{formatDuration(session.totalFocusTime)}</div>
                                                </div>
                                                <div>
                                                    <div className="stat-label">Pauze</div>
                                                    <div className="stat-value">{formatDuration(session.totalBreakTime)}</div>
                                                </div>
                                                <div>
                                                    <div className="stat-label">Task-uri</div>
                                                    <div className="stat-value">{doneTasks}/{session.tasks.length}</div>
                                                </div>
                                                <div>
                                                    <div className="stat-label">Puncte</div>
                                                    <div className="stat-value" style={{ color: '#e0a84e' }}>
                                                        {session.completedPomodoros * 10}
                                                    </div>
                                                </div>
                                            </div>

                                            {session.tasks.length > 0 && (
                                                <div className="history-detail-tasks">
                                                    {session.tasks.map(task => (
                                                        <div className="history-task-row" key={task.id}>
                                                            <span className="history-task-left" style={{
                                                                color: task.completed ? 'var(--text-h)' : 'var(--text)',
                                                                opacity: task.completed ? 1 : 0.6,
                                                            }}>
                                                                <span className={`mini-checkbox mini-checkbox--sm ${task.completed ? 'mini-checkbox--done' : 'mini-checkbox--pending'}`}>
                                                                    {task.completed && <CheckIcon size={8} stroke="#fff" />}
                                                                </span>
                                                                {task.title}
                                                            </span>
                                                            <span className="mono-sm">
                                                                {task.actualPomodoros}/{task.estimatedPomodoros}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {sessions.length > 1 && (
                        <button onClick={onClearAll} className="history-clear">
                            <TrashIcon size={12} /> Șterge tot istoricul
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default SessionHistory
