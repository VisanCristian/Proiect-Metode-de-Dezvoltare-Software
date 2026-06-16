import { createContext, useContext, useState, useEffect } from 'react';
import usePomodoro from '../hooks/usePomodoro';
import pomodoroStorage from '../services/pomodoro_storage';
import { DEFAULTS } from '../utils/Pomodoro/constants';

const PomodoroContext = createContext(null);

export function PomodoroProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);
    const timer = usePomodoro(settings);
    const [totalFocusTime, setTotalFocusTime] = useState(0);
    const [totalBreakTime, setTotalBreakTime] = useState(0);
    const [sessionState, setSessionState] = useState('idle');
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Increment focus/break time every second while session is active — runs even when navigating away
    useEffect(() => {
        if (sessionState !== 'active' || !timer.isRunning) return
        const interval = setInterval(() => {
            if (timer.phase === 'focus') setTotalFocusTime((prev) => prev + 1)
            else setTotalBreakTime((prev) => prev + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [sessionState, timer.isRunning, timer.phase])

    // Persist focus/break time to backend every 30s so navigation doesn't lose progress
    useEffect(() => {
        if (sessionState !== 'active' || !currentSessionId) return
        const interval = setInterval(() => {
            pomodoroStorage.saveProgress(currentSessionId, {
                totalFocusTime,
                totalBreakTime,
                completedPomodoros: timer.completedCycle,
            }).catch(() => {})
        }, 30000)
        return () => clearInterval(interval)
    }, [sessionState, currentSessionId, totalFocusTime, totalBreakTime, timer.completedCycle])

    return (
        <PomodoroContext.Provider value={{
            timer, settings, setSettings,
            totalFocusTime, setTotalFocusTime,
            totalBreakTime, setTotalBreakTime,
            sessionState, setSessionState,
            sessionStartTime, setSessionStartTime,
            currentSessionId, setCurrentSessionId,
        }}>
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoroContext() {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoroContext must be used inside PomodoroProvider');
    }
    return context;
}
