import { useState } from 'react'
import { GearIcon, CloseIcon } from '../Icons/Icons'
import './SettingsPanel.css'

function SettingsPanel({ settings, onSave }) {
    const [isOpen, setIsOpen] = useState(false)
    const [focusMin, setFocusMin] = useState(settings.FOCUS_TIME / 60)
    const [breakMin, setBreakMin] = useState(settings.BREAK_TIME / 60)
    const [longBreakMin, setLongBreakMin] = useState(settings.LONG_BREAK_TIME / 60)
    const [cycles, setCycles] = useState(settings.CYCLES_BEFORE_LONG_BREAK)
    const [autoStart, setAutoStart] = useState(settings.AUTO_START || false)

    const openPanel = () => {
        setFocusMin(settings.FOCUS_TIME / 60)
        setBreakMin(settings.BREAK_TIME / 60)
        setLongBreakMin(settings.LONG_BREAK_TIME / 60)
        setCycles(settings.CYCLES_BEFORE_LONG_BREAK)
        setAutoStart(settings.AUTO_START || false)
        setIsOpen(true)
    }

    const handleSave = () => {
        onSave({
            FOCUS_TIME: focusMin * 60,
            BREAK_TIME: breakMin * 60,
            LONG_BREAK_TIME: longBreakMin * 60,
            CYCLES_BEFORE_LONG_BREAK: cycles,
            AUTO_START: autoStart,
        })
        setIsOpen(false)
    }

    if (!isOpen) {
        return (
            <button onClick={openPanel} className="settings-toggle" title="Settings">
                <GearIcon />
            </button>
        )
    }

    return (
        <div className="settings-panel">
            <div className="settings-header">
                <h3><GearIcon /> Settings</h3>
                <button onClick={() => setIsOpen(false)} className="settings-close">
                    <CloseIcon />
                </button>
            </div>

            <div className="settings-row">
                <span>Focus (min)</span>
                <input type="number" min="1" max="60" value={focusMin} aria-label="Focus (min)"
                    onChange={(e) => setFocusMin(Number(e.target.value))}
                    className="settings-input" />
            </div>

            <div className="settings-row">
                <span>Short break (min)</span>
                <input type="number" min="1" max="30" value={breakMin} aria-label="Short break (min)"
                    onChange={(e) => setBreakMin(Number(e.target.value))}
                    className="settings-input" />
            </div>

            <div className="settings-row">
                <span>Long break (min)</span>
                <input type="number" min="1" max="60" value={longBreakMin} aria-label="Long break (min)"
                    onChange={(e) => setLongBreakMin(Number(e.target.value))}
                    className="settings-input" />
            </div>

            <div className="settings-row">
                <span>Cycles</span>
                <input type="number" min="1" max="10" value={cycles} aria-label="Cycles"
                    onChange={(e) => setCycles(Number(e.target.value))}
                    className="settings-input" />
            </div>

            <div className="settings-row" style={{ marginBottom: '20px' }}>
                <span>Auto-start</span>
                <div className="settings-switch">
                    <input type="checkbox" checked={autoStart} aria-label="Auto-start"
                        onChange={(e) => setAutoStart(e.target.checked)} />
                    <div className="settings-switch-track"
                        style={{ background: autoStart ? 'var(--accent)' : 'var(--border)' }}>
                        <div className="settings-switch-thumb"
                            style={{ left: autoStart ? '23px' : '3px' }} />
                    </div>
                </div>
            </div>

            <button onClick={handleSave} className="settings-save">Save</button>
        </div>
    )
}

export default SettingsPanel
