import { useCallback, useRef } from 'react'

function playNotes(ctx, notes, type = 'sine') {
    let t = ctx.currentTime
    notes.forEach(({ freq, duration, vol = 0.25 }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = type
        osc.frequency.setValueAtTime(freq, t)

        gain.gain.setValueAtTime(vol, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

        osc.start(t)
        osc.stop(t + duration)
        t += duration * 0.75
    })
}

export default function useSound() {
    const ctxRef = useRef(null)

    const getCtx = () => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume()
        }
        return ctxRef.current
    }

    const playFocus = useCallback(() => {
        const ctx = getCtx()
        playNotes(ctx, [
            { freq: 523, duration: 0.12, vol: 0.2 },
            { freq: 659, duration: 0.12, vol: 0.25 },
            { freq: 784, duration: 0.25, vol: 0.3 },
        ], 'triangle')
    }, [])

    const playBreak = useCallback(() => {
        const ctx = getCtx()
        playNotes(ctx, [
            { freq: 784, duration: 0.15, vol: 0.2 },
            { freq: 659, duration: 0.15, vol: 0.18 },
            { freq: 523, duration: 0.3, vol: 0.15 },
        ], 'sine')
    }, [])

    const playLongBreak = useCallback(() => {
        const ctx = getCtx()
        playNotes(ctx, [
            { freq: 523, duration: 0.1, vol: 0.2 },
            { freq: 659, duration: 0.1, vol: 0.22 },
            { freq: 784, duration: 0.1, vol: 0.25 },
            { freq: 1047, duration: 0.35, vol: 0.3 },
        ], 'triangle')
    }, [])

    const playForPhase = useCallback((phase) => {
        if (phase === 'focus') playFocus()
        else if (phase === 'longbreak') playLongBreak()
        else playBreak()
    }, [playFocus, playBreak, playLongBreak])

    return { playForPhase }
}
