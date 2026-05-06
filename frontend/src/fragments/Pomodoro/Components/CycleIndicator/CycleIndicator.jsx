import { PHASE_COLORS } from '../../../../utils/Pomodoro/constants'

function CycleIndicator({ completedCycle, total = 4 }) {
    const color = PHASE_COLORS.focus

    return (
        <div className="cycles">
            {Array(total).fill(0).map((_, i) => (
                <div key={i} className="cycle-dot" style={{
                    backgroundColor: i < completedCycle ? color : 'transparent',
                    border: `2px solid ${i < completedCycle ? color : 'var(--border)'}`,
                    boxShadow: i < completedCycle ? `0 0 6px ${color}40` : 'none',
                }} />
            ))}
        </div>
    )
}

export default CycleIndicator
