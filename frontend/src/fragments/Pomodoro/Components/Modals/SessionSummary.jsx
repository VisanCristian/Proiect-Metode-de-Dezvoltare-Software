import { CalendarIcon, ClockIcon, CircleIcon, CheckIcon, DropIcon, StarIcon } from '../Icons/Icons'
import './SessionSummary.css'

function SessionSummary({ session, onClose }) {
    const startDate = new Date(session.startTime)
    const endDate = new Date(session.endTime)

    const formatTime = (d) => d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    const formatDate = (d) => d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })

    const focusMin = Math.floor(session.totalFocusTime / 60)
    const breakMin = Math.floor(session.totalBreakTime / 60)
    const points = session.completedPomodoros * 10
    const doneTasks = session.tasks.filter(t => t.completed).length

    const rows = [
        { icon: <CalendarIcon />, label: 'Data', value: formatDate(startDate) },
        { icon: <ClockIcon size={14} />, label: 'Interval', value: `${formatTime(startDate)} → ${formatTime(endDate)}` },
        { icon: <ClockIcon size={14} stroke="#5b8fb9" />, label: 'Timp focus', value: `${focusMin} min` },
        { icon: <DropIcon stroke="#4ecdc4" />, label: 'Timp pauze', value: `${breakMin} min` },
        { icon: <CircleIcon size={14} style={{ color: '#e06469' }} />, label: 'Pomodoro-uri', value: session.completedPomodoros },
        { icon: <CheckIcon stroke="#4ecdc4" />, label: 'Task-uri', value: `${doneTasks}/${session.tasks.length}` },
        { icon: <StarIcon style={{ color: '#e0a84e' }} />, label: 'Puncte', value: points, valueColor: '#e0a84e' },
    ]

    return (
        <div className="summary-overlay">
            <div className="summary-modal">
                <h2 className="summary-title">Rezumat Sesiune</h2>

                <div style={{ marginBottom: '16px' }}>
                    {rows.map(({ icon, label, value, valueColor }) => (
                        <div className="summary-row" key={label}>
                            <span className="summary-row-label">{icon} {label}</span>
                            <span className="summary-row-value" style={valueColor ? { color: valueColor } : undefined}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {session.tasks.length > 0 && (
                    <div className="summary-tasks">
                        <h4>Task-uri</h4>
                        {session.tasks.map(task => (
                            <div className="summary-task" key={task.id}>
                                <span className="summary-task-left" style={{
                                    color: task.completed ? 'var(--text-h)' : 'var(--text)',
                                }}>
                                    <span className={`mini-checkbox mini-checkbox--md ${task.completed ? 'mini-checkbox--done' : 'mini-checkbox--pending'}`}>
                                        {task.completed && <CheckIcon size={10} stroke="#fff" />}
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

                <button onClick={onClose} className="summary-close">Închide</button>
            </div>
        </div>
    )
}

export default SessionSummary
