import { useState, useEffect, useRef, useCallback } from 'react'
import { usePomodoroContext } from '../../context/PomodoroContext'
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
    const [tasks, setTasks] = useState([])
    const [activeTaskId, setActiveTaskId] = useState(null)
    const [currentSessionId, setCurrentSessionId] = useState(null)

    const [sessionState, setSessionState] = useState('idle')
    const [sessionStartTime, setSessionStartTime] = useState(null)
    const [totalFocusTime, setTotalFocusTime] = useState(0)
    const [totalBreakTime, setTotalBreakTime] = useState(0)
    const [sessionSummary, setSessionSummary] = useState(null)
    const [pastSessions, setPastSessions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const { timer, settings, setSettings } = usePomodoroContext()
    const { playForPhase } = useSound()
    const { notify } = useBrowserNotification()
    useBeforeUnload(sessionState === 'active')
    const prevPhaseRef = useRef(timer.phase)
    const prevCompletedCycleRef = useRef(timer.completedCycle)
    const taskSyncVersionRef = useRef(0)

    const applyCurrentSession = useCallback((session) => {
        setCurrentSessionId(session.id)
        setSettings(session.settings ?? DEFAULTS)
        setTasks(session.tasks ?? [])
        setSessionStartTime(session.startTime)
        setTotalFocusTime(session.totalFocusTime ?? 0)
        setTotalBreakTime(session.totalBreakTime ?? 0)
        setActiveTaskId((prev) => (session.tasks ?? []).some((task) => task.id === prev) ? prev : null)
    }, [])

    const runWithErrorHandling = useCallback(async (action) => {
        setErrorMessage('')
        try {
            return await action()
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred while communicating with the backend.')
            throw error
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const hydrate = async () => {
            try {
                const [currentSession, sessions] = await Promise.all([
                    pomodoroStorage.getCurrentSession(),
                    pomodoroStorage.getSessions(),
                ])

                if (!isMounted) {
                    return
                }

                applyCurrentSession(currentSession)
                setPastSessions(sessions)
                setSessionState(currentSession.status === 'active' ? 'active' : 'idle')
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error instanceof Error ? error.message : 'An error occurred while loading the data.')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void hydrate()

        return () => {
            isMounted = false
        }
    }, [applyCurrentSession])

    const handleSaveSettings = useCallback(async (nextSettings) => {
        setSettings(nextSettings)

        if (!currentSessionId) {
            return
        }

        const updatedSession = await runWithErrorHandling(() => (
            pomodoroStorage.saveSettings(currentSessionId, nextSettings)
        ))

        applyCurrentSession(updatedSession)
    }, [applyCurrentSession, currentSessionId, runWithErrorHandling])

    const persistTasks = useCallback(async (nextTasks) => {
        if (!currentSessionId) {
            return nextTasks
        }

        const requestVersion = taskSyncVersionRef.current + 1
        taskSyncVersionRef.current = requestVersion

        const savedTasks = await runWithErrorHandling(() => (
            pomodoroStorage.saveTasks(currentSessionId, nextTasks)
        ))

        if (requestVersion === taskSyncVersionRef.current) {
            setTasks(savedTasks)
            setActiveTaskId((prev) => savedTasks.some((task) => task.id === prev) ? prev : null)
        }

        return savedTasks
    }, [currentSessionId, runWithErrorHandling])

    const handleTasksChange = useCallback(async (nextTasks) => {
        setTasks(nextTasks)
        await persistTasks(nextTasks)
    }, [persistTasks])

    const incrementActiveTaskPomodoro = useCallback(async () => {
        if (!activeTaskId) return

        const updatedTasks = tasks.map((task) =>
            task.id === activeTaskId
                ? { ...task, actualPomodoros: task.actualPomodoros + 1 }
                : task
        )

        setTasks(updatedTasks)
        await persistTasks(updatedTasks)
    }, [activeTaskId, persistTasks, tasks])

    const startSession = useCallback(async () => {
        if (!currentSessionId) {
            return
        }

        const startedSession = await runWithErrorHandling(() => (
            pomodoroStorage.startSession(currentSessionId)
        ))

        applyCurrentSession(startedSession)
        timer.reset()
        if (startedSession.settings?.AUTO_START) {
            timer.start()
        }
        setSessionState('active')
        setSessionStartTime(startedSession.startTime ?? Date.now())
        setTotalFocusTime(startedSession.totalFocusTime)
        setTotalBreakTime(startedSession.totalBreakTime)
    }, [applyCurrentSession, currentSessionId, runWithErrorHandling, timer])

    const endSession = useCallback(async () => {
        if (!currentSessionId) {
            return
        }

        const summary = {
            startTime: sessionStartTime,
            endTime: Date.now(),
            totalFocusTime,
            totalBreakTime,
            completedPomodoros: timer.completedCycle,
            tasks: [...tasks],
            points: timer.completedCycle * 10,
        }

        await runWithErrorHandling(() => pomodoroStorage.saveSession(currentSessionId, summary))

        const [currentSession, sessions] = await runWithErrorHandling(() => Promise.all([
            pomodoroStorage.getCurrentSession(),
            pomodoroStorage.getSessions(),
        ]))

        applyCurrentSession(currentSession)
        setPastSessions(sessions)
        setSessionSummary(summary)
        setSessionState('ended')
        timer.reset()
    }, [
        applyCurrentSession,
        currentSessionId,
        runWithErrorHandling,
        sessionStartTime,
        tasks,
        timer,
        totalBreakTime,
        totalFocusTime,
    ])

    const abandonSession = useCallback(async () => {
        if (!currentSessionId) {
            return
        }

        if (window.confirm('Are you sure? The session data will not be saved.')) {
            await runWithErrorHandling(() => pomodoroStorage.abandonSession(currentSessionId))
            const [currentSession, sessions] = await runWithErrorHandling(() => Promise.all([
                pomodoroStorage.getCurrentSession(),
                pomodoroStorage.getSessions(),
            ]))

            applyCurrentSession(currentSession)
            setPastSessions(sessions)
            setSessionState('idle')
            setSessionStartTime(null)
            timer.reset()
        }
    }, [applyCurrentSession, currentSessionId, runWithErrorHandling, timer])

    const closeSummary = () => {
        setSessionSummary(null)
        setSessionState('idle')
        setSessionStartTime(null)
    }

    const clearHistory = useCallback(async () => {
        if (window.confirm('Are you sure? The session history will be permanently deleted.')) {
            await runWithErrorHandling(() => pomodoroStorage.clearSessions())
            setPastSessions([])
        }
    }, [runWithErrorHandling])

    useEffect(() => {
        if (sessionState !== 'active' || !timer.isRunning) return
        const interval = setInterval(() => {
            if (timer.phase === 'focus') setTotalFocusTime((previous) => previous + 1)
            else setTotalBreakTime((previous) => previous + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [sessionState, timer.isRunning, timer.phase])

    useEffect(() => {
        if (prevPhaseRef.current !== timer.phase) {
            playForPhase(timer.phase)
            notify(
                PHASE_LABELS[timer.phase],
                timer.phase === 'focus'
                    ? 'Focus time has started!'
                    : 'Time for a break!'
            )
            prevPhaseRef.current = timer.phase
        }
    }, [timer.phase, playForPhase, notify])

    useEffect(() => {
        if (timer.completedCycle > prevCompletedCycleRef.current && activeTaskId) {
            void incrementActiveTaskPomodoro()
        }
        prevCompletedCycleRef.current = timer.completedCycle
    }, [timer.completedCycle, activeTaskId, incrementActiveTaskPomodoro])

    useEffect(() => {
        const mins = String(Math.floor(timer.timeLeft / 60)).padStart(2, '0')
        const secs = String(timer.timeLeft % 60).padStart(2, '0')
        document.title = timer.isRunning
            ? `${mins}:${secs} – ${PHASE_LABELS[timer.phase]} | StudyApp`
            : 'StudyApp – Pomodoro'
    }, [timer.timeLeft, timer.phase, timer.isRunning])

    const errorBanner = errorMessage ? <p role="alert">{errorMessage}</p> : null

    if (isLoading) {
        return (
            <div className="pomodoro-page">
                <p>Loading...</p>
            </div>
        )
    }

    if (sessionState === 'idle') {
        return (
            <div className="pomodoro-page pomodoro-layout">
                <div className="pomodoro-main">
                    {errorBanner}
                    <div className="idle-icon"><TimerClockIcon /></div>
                    <h1 className="idle-title">Pomodoro</h1>
                    <p className="idle-desc">Prepare your tasks and start a study session.</p>

                    <TaskList tasks={tasks} activeTaskId={activeTaskId}
                        onTasksChange={handleTasksChange} onSelectTask={setActiveTaskId} />
                    <SessionHistory sessions={pastSessions} onClearAll={clearHistory} />

                    <button onClick={() => void startSession()} className="start-btn">
                        <PlayIcon size={16} /> Start Session
                    </button>
                </div>
                <aside className="pomodoro-sidebar">
                    <SettingsPanel settings={settings} onSave={handleSaveSettings} />
                </aside>
            </div>
        )
    }

    return (
        <div className="pomodoro-page">
            <div className="pomodoro-main">
                {errorBanner}
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
                    <button onClick={() => void endSession()} className="end-btn">
                        <CheckIcon size={14} stroke="#fff" /> Finish
                    </button>
                    <button onClick={() => void abandonSession()} className="abandon-btn">
                        <CloseIcon size={14} /> Abandon
                    </button>
                </div>

                {sessionSummary && <SessionSummary session={sessionSummary} onClose={closeSummary} />}
            </div>
        </div>
    )
}

