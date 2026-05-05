import { StopIcon, PlayIcon, PauseIcon, SkipIcon } from '../Icons/Icons'
import './TimerControls.css'

function TimerControls({ isRunning, onStart, onPause, onReset, onSkip }) {
    const primaryColor = isRunning ? '#e06469' : '#4ecdc4'
    const primaryShadow = isRunning
        ? '0 4px 14px rgba(224, 100, 105, 0.3)'
        : '0 4px 14px rgba(78, 205, 196, 0.3)'

    return (
        <div className="controls">
            <button onClick={onReset} className="ctrl-btn" title="Stop" aria-label="Stop">
                <StopIcon />
            </button>
            <button
                onClick={isRunning ? onPause : onStart}
                className="ctrl-btn ctrl-primary"
                style={{ background: primaryColor, boxShadow: primaryShadow }}
                title={isRunning ? 'Pause' : 'Start'}
                aria-label={isRunning ? 'Pause' : 'Start'}
            >
                {isRunning ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={onSkip} className="ctrl-btn" title="Skip" aria-label="Skip">
                <SkipIcon />
            </button>
        </div>
    )
}

export default TimerControls
