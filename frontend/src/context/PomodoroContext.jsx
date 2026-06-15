import { createContext, useContext, useState } from 'react';
import usePomodoro from '../hooks/usePomodoro';
import { DEFAULTS } from '../utils/Pomodoro/constants';

const PomodoroContext = createContext(null);

export function PomodoroProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);
    const timer = usePomodoro(settings);

    return (
        <PomodoroContext.Provider value={{ timer, settings, setSettings }}>
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
