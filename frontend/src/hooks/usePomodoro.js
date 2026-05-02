import { useState, useEffect, useCallback } from "react";
import { DEFAULTS } from "../utils/Pomodoro/constants";

export default function usePomodoro(settings = DEFAULTS) {
    const [timeLeft, setTimeLeft] = useState(settings.FOCUS_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [phase, setPhase] = useState('focus');
    const [completedCycle, setCompletedCycles] = useState(0);
    const [totalPhaseTime, setTotalPhaseTime] = useState(settings.FOCUS_TIME);

    const getPhaseDuration = useCallback((currentPhase) => {
        if (currentPhase === 'focus') return settings.FOCUS_TIME
        if (currentPhase === 'break') return settings.BREAK_TIME
        return settings.LONG_BREAK_TIME
    }, [settings])

    const start = useCallback(() => {
        setIsRunning(true);
    }, [])

    const pause = useCallback(() => {
        setIsRunning(false);
    }, [])

    const reset = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(getPhaseDuration('focus'));
        setPhase('focus');
        setCompletedCycles(0);
        setTotalPhaseTime(getPhaseDuration('focus'));
    }, [getPhaseDuration])

    const skip = useCallback(() => {
        setIsRunning(true);
        setTimeLeft(0);
    }, [])

    const advancePhase = useCallback(() => {
        let nextPhase = 'focus'
        let nextCycle = completedCycle

        if (phase === 'focus') {
            nextCycle = completedCycle + 1
            nextPhase = nextCycle >= settings.CYCLES_BEFORE_LONG_BREAK ? 'longbreak' : 'break'
            setCompletedCycles(nextCycle)
        }
        else if (phase === 'break') {
            nextPhase = 'focus'
        }
        else {
            nextPhase = 'focus'
            setCompletedCycles(0)
        }

        const nextDuration = getPhaseDuration(nextPhase)
        setPhase(nextPhase)
        setTimeLeft(nextDuration)
        setTotalPhaseTime(nextDuration)
        setIsRunning(Boolean(settings.AUTO_START))
    }, [completedCycle, getPhaseDuration, phase, settings])

    useEffect(() => {
        if (!isRunning) return;
        if (timeLeft === 0) {
            const timeout = setTimeout(() => {
                advancePhase()
            }, 0)
            return () => clearTimeout(timeout)
        }
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000)
        return () => clearInterval(interval);
    }, [advancePhase, isRunning, timeLeft])

    return { timeLeft, isRunning, phase, completedCycle, totalPhaseTime, start, pause, reset, skip };
}   
