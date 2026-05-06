import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import usePomodoro from './usePomodoro'

describe('usePomodoro', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('trece din focus in break si se opreste cand AUTO_START este false', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() =>
      usePomodoro({
        FOCUS_TIME: 1,
        BREAK_TIME: 5,
        LONG_BREAK_TIME: 10,
        CYCLES_BEFORE_LONG_BREAK: 4,
        AUTO_START: false,
      })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(result.current.phase).toBe('break')
    expect(result.current.timeLeft).toBe(5)
    expect(result.current.completedCycle).toBe(1)
    expect(result.current.isRunning).toBe(false)
  })

  it('continua automat in faza urmatoare cand AUTO_START este true', async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() =>
      usePomodoro({
        FOCUS_TIME: 1,
        BREAK_TIME: 5,
        LONG_BREAK_TIME: 10,
        CYCLES_BEFORE_LONG_BREAK: 4,
        AUTO_START: true,
      })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(result.current.phase).toBe('break')
    expect(result.current.timeLeft).toBe(5)
    expect(result.current.isRunning).toBe(true)
  })
})
