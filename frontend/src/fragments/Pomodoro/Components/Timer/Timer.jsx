import { PHASE_COLORS } from '../../../../utils/Pomodoro/constants'
import './Timer.css'

function Timer({ timeLeft, totalPhaseTime, phase }) {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
    const seconds = String(timeLeft % 60).padStart(2, '0')

    const radius = 120
    const strokeWidth = 6
    const circumference = 2 * Math.PI * radius
    const progress = timeLeft / totalPhaseTime
    const offset = circumference * (1 - progress)
    const color = PHASE_COLORS[phase]
    const isUrgent = timeLeft <= 10 && timeLeft > 0

    return (
        <div className={`timer-wrap timer-container ${isUrgent ? 'timer-pulse' : ''}`}>
            <svg width="260" height="260" viewBox="0 0 260 260">
                <circle cx="130" cy="130" r={radius} fill="none"
                    stroke="var(--border)" strokeWidth={strokeWidth} />
                <circle cx="130" cy="130" r={radius} fill="none"
                    stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease',
                        filter: `drop-shadow(0 0 6px ${color}40)`,
                    }} />
            </svg>
            <div className="timer-center">
                <span className="timer-digits" style={{ color: isUrgent ? color : 'var(--text-h)' }}>
                    {minutes}:{seconds}
                </span>
            </div>
        </div>
    )
}

export default Timer
