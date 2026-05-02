import { PHASE_LABELS, PHASE_COLORS } from '../../../../utils/Pomodoro/constants'
import { ClockIcon, CircleIcon, CheckIcon } from '../Icons/Icons'

function SessionStats({ totalFocusTime, completedPomodoros, tasks, phase }) {
    const doneTasks = tasks.filter(t => t.completed).length
    const focusMin = Math.floor(totalFocusTime / 60)
    const focusSec = totalFocusTime % 60

    return (
        <div className="stats-bar">
            <div className="stat">
                <div className="stat-icon" style={{ background: '#5b8fb915', color: '#5b8fb9' }}>
                    <ClockIcon />
                </div>
                <div className="stat-value">{focusMin}:{String(focusSec).padStart(2, '0')}</div>
                <div className="stat-label">Focus</div>
            </div>

            <div className="stat">
                <div className="stat-icon" style={{ background: '#e0646915', color: '#e06469' }}>
                    <CircleIcon />
                </div>
                <div className="stat-value">{completedPomodoros}</div>
                <div className="stat-label">Pomodoros</div>
            </div>

            <div className="stat">
                <div className="stat-icon" style={{ background: '#4ecdc415', color: '#4ecdc4' }}>
                    <CheckIcon />
                </div>
                <div className="stat-value">{doneTasks}/{tasks.length}</div>
                <div className="stat-label">Tasks</div>
            </div>

            <div className="stat">
                <div className="stat-icon"
                    style={{ background: `${PHASE_COLORS[phase]}15`, color: PHASE_COLORS[phase] }}>
                    <CircleIcon />
                </div>
                <div className="stat-value" style={{ fontSize: '13px', color: PHASE_COLORS[phase] }}>
                    {PHASE_LABELS[phase]}
                </div>
                <div className="stat-label">Faza</div>
            </div>
        </div>
    )
}

export default SessionStats
