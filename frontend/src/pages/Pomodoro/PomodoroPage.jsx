import { useState, useEffect, useRef, useCallback } from 'react'
import usePomodoro from "../../hooks/usePomodoro"
import useSound from "../../hooks/useSound"
import useBrowserNotification from "../../hooks/useBrowserNotification"
import useBeforeUnload from "../../hooks/useBeforeUnload"
import pomodoroStorage from "../../services/pomodoro_storage"
import { DEFAULTS, PHASE_LABELS } from "../../utils/Pomodoro/constants"
import { TimerClockIcon, PlayIcon, CheckIcon, CloseIcon } from '../../fragments/Pomodoro/Components/Icons/Icons'
import Timer from "../../fragments/Pomodoro/Components/Timer/Timer"
import TimerControls from "../../fragments/Pomodoro/Components/TimerControls/TimerControls"
import PhaseIndicator from "../../fragments/Pomodoro/Components/PhaseIndicator/PhaseIndicator"
import CycleIndicator from "../../fragments/Pomodoro/Components/CycleIndicator/CycleIndicator"
import SettingsPanel from "../../fragments/Pomodoro/Components/Settings/SettingsPanel"
import TaskList from "../../fragments/Pomodoro/Components/Task/TaskList"
import SessionStats from "../../fragments/Pomodoro/Components/Session/SessionStats"
import SessionSummary from "../../fragments/Pomodoro/Components/Modals/SessionSummary"
import SessionHistory from "../../fragments/Pomodoro/Components/Session/SessionHistory"
import '../../fragments/Pomodoro/index.css'
import './PomodoroPage.css'

export default function PomodoroPage() {
    const [settings, setSettings] = useState(() => pomodoroStorage.getSettings() || DEFAULTS)
    const [tasks, setTasks] = useState(() => pomodoroStorage.getTasks())
    const [activeTaskId, setActiveTaskId] = useState(null)

    const [sessionState, setSessionState] = useState('idle')
    const [sessionStartTime, setSessionStartTime] = useState(null)
    const [totalFocusTime, setTotalFocusTime] = useState(0)
    const [totalBreakTime, setTotalBreakTime] = useState(0)
    const [sessionSummary, setSessionSummary] = useState(null)
    const [pastSessions, setPastSessions] = useState(() => pomodoroStorage.getSessions())

    const timer = usePomodoro(settings)
    const { playForPhase } = useSound()
    const { notify } = useBrowserNotification()
    useBeforeUnload(sessionState === 'active')
    const prevPhaseRef = useRef(timer.phase)

    const handleSaveSettings = (s) => {
        setSettings(s)
        pomodoroStorage.saveSettings(s)
    }
    const handleTasksChange = (t) => { setTasks(t); pomodoroStorage.saveTasks(t) }
    const incrementActiveTaskPomodoro = useCallback(() => {
        if (!activeTaskId) return

        setTasks(prev => {
            const updated = prev.map(t =>
                t.id === activeTaskId ? { ...t, actualPomodoros: t.actualPomodoros + 1 } : t
            )
            pomodoroStorage.saveTasks(updated)
            return updated
        })
    }, [activeTaskId])

    const startSession = () => {
        timer.reset()
        setSessionState('active')
        setSessionStartTime(Date.now())
        setTotalFocusTime(0)
        setTotalBreakTime(0)
    }

    const endSession = () => {
        const summary = {
            startTime: sessionStartTime,
            endTime: Date.now(),
            totalFocusTime, totalBreakTime,
            completedPomodoros: timer.completedCycle,
            tasks: [...tasks],
            points: timer.completedCycle * 10,
        }
        pomodoroStorage.saveSession(summary)
        setPastSessions(pomodoroStorage.getSessions())
        setSessionSummary(summary)
        setSessionState('ended')
        timer.reset()
    }

    const abandonSession = () => {
        if (window.confirm('Ești sigur? Datele sesiunii nu vor fi salvate.')) {
            setSessionState('idle')
            setSessionStartTime(null)
            timer.reset()
        }
    }

    const closeSummary = () => {
        setSessionSummary(null)
        setSessionState('idle')
        setSessionStartTime(null)
    }

    const clearHistory = () => {
        if (window.confirm('Ești sigur? Istoricul sesiunilor va fi șters permanent.')) {
            pomodoroStorage.clearSessions()
            setPastSessions([])
        }
    }

    // Acumulează timp focus/break
    useEffect(() => {
        if (sessionState !== 'active' || !timer.isRunning) return
        const interval = setInterval(() => {
            if (timer.phase === 'focus') setTotalFocusTime(p => p + 1)
            else setTotalBreakTime(p => p + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [sessionState, timer.isRunning, timer.phase])

    // Sunet + notificare + auto-count pomodoro la schimbare de fază
    useEffect(() => {
        if (prevPhaseRef.current !== timer.phase) {
            playForPhase(timer.phase)
            notify(
                PHASE_LABELS[timer.phase],
                timer.phase === 'focus'
                    ? 'Timpul de concentrare a început!'
                    : 'E timpul pentru o pauză!'
            )
            if (prevPhaseRef.current === 'focus' && activeTaskId) {
                const timeout = setTimeout(() => {
                    incrementActiveTaskPomodoro()
                }, 0)
                prevPhaseRef.current = timer.phase
                return () => clearTimeout(timeout)
            }
            prevPhaseRef.current = timer.phase
        }
    }, [timer.phase, playForPhase, notify, activeTaskId, incrementActiveTaskPomodoro])

    // Tab title
    useEffect(() => {
        const mins = String(Math.floor(timer.timeLeft / 60)).padStart(2, '0')
        const secs = String(timer.timeLeft % 60).padStart(2, '0')
        document.title = timer.isRunning
            ? `${mins}:${secs} – ${PHASE_LABELS[timer.phase]} | StudyApp`
            : 'StudyApp – Pomodoro'
    }, [timer.timeLeft, timer.phase, timer.isRunning])

    // ── Idle screen ──
    if (sessionState === 'idle') {
        return (
            <div className="pomodoro-page">
                <SettingsPanel settings={settings} onSave={handleSaveSettings} />
                <div className="idle-icon"><TimerClockIcon /></div>
                <h1 className="idle-title">Pomodoro</h1>
                <p className="idle-desc">Pregătește-ți task-urile și începe o sesiune de studiu.</p>

                <TaskList tasks={tasks} activeTaskId={activeTaskId}
                    onTasksChange={handleTasksChange} onSelectTask={setActiveTaskId} />
                <SessionHistory sessions={pastSessions} onClearAll={clearHistory} />

                <button onClick={startSession} className="start-btn">
                    <PlayIcon size={16} /> Start Sesiune
                </button>
            </div>
        )
    }

    // ── Active screen ──
    return (
        <div className="pomodoro-page">
            <SettingsPanel settings={settings} onSave={handleSaveSettings} />
            <PhaseIndicator phase={timer.phase} />
            <Timer timeLeft={timer.timeLeft} totalPhaseTime={timer.totalPhaseTime} phase={timer.phase} />
            <CycleIndicator completedCycle={timer.completedCycle} total={settings.CYCLES_BEFORE_LONG_BREAK} />
            <TimerControls isRunning={timer.isRunning}
                onStart={timer.start} onPause={timer.pause}
                onReset={timer.reset} onSkip={timer.skip} />

            <SessionStats totalFocusTime={totalFocusTime} completedPomodoros={timer.completedCycle}
                tasks={tasks} phase={timer.phase} />
            <TaskList tasks={tasks} activeTaskId={activeTaskId}
                onTasksChange={handleTasksChange} onSelectTask={setActiveTaskId} />

            <div className="session-actions">
                <button onClick={endSession} className="end-btn">
                    <CheckIcon size={14} stroke="#fff" /> Încheie
                </button>
                <button onClick={abandonSession} className="abandon-btn">
                    <CloseIcon size={14} /> Abandonează
                </button>
            </div>

            {sessionSummary && <SessionSummary session={sessionSummary} onClose={closeSummary} />}
        </div>
    )
}
