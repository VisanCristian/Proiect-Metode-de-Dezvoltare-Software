import { PHASE_COLORS, PHASE_LABELS } from '../../../../utils/Pomodoro/constants'

function PhaseIndicator({ phase }) {
    const color = PHASE_COLORS[phase]

    return (
        <div className="phase-badge"
            style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}>
            <span className="phase-dot"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
            <span className="phase-label" style={{ color }}>
                {PHASE_LABELS[phase]}
            </span>
        </div>
    )
}

export default PhaseIndicator
