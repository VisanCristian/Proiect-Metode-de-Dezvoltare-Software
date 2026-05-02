import { render, screen, act, fireEvent, cleanup } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import PomodoroPage from './PomodoroPage'

vi.mock('../../hooks/useSound', () => ({
  default: () => ({ playForPhase: vi.fn() }),
}))

vi.mock('../../hooks/useBrowserNotification', () => ({
  default: () => ({ notify: vi.fn() }),
}))

vi.mock('../../hooks/useBeforeUnload', () => ({
  default: () => undefined,
}))

describe('PomodoroPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
    cleanup()
  })

  it('porneste o sesiune cu setarile salvate recent', async () => {
    render(<PomodoroPage />)

    fireEvent.click(screen.getByTitle('Setări'))
    fireEvent.change(screen.getByLabelText('Focus (min)'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvează' }))
    fireEvent.click(screen.getByRole('button', { name: /Start Sesiune/i }))

    expect(screen.getByText('30:00')).toBeInTheDocument()
  })

  it('creste pomodoro-urile taskului activ cand se termina un focus', async () => {
    localStorage.setItem('pomodoro_settings', JSON.stringify({
      FOCUS_TIME: 1,
      BREAK_TIME: 1,
      LONG_BREAK_TIME: 2,
      CYCLES_BEFORE_LONG_BREAK: 4,
      AUTO_START: false,
    }))

    render(<PomodoroPage />)

    fireEvent.change(screen.getByPlaceholderText('Adaugă un task...'), { target: { value: 'Capitol 1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adaugă task' }))
    fireEvent.click(screen.getByText('Capitol 1'))
    fireEvent.click(screen.getByRole('button', { name: /Start Sesiune/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    await act(async () => {
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    await act(async () => {
      vi.runOnlyPendingTimers()
      await Promise.resolve()
    })

    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(screen.getAllByText('1/1')[0]).toBeInTheDocument()
  })

  it('salveaza sesiunea in localStorage cand se incheie', () => {
    render(<PomodoroPage />)

    fireEvent.click(screen.getByRole('button', { name: /Start Sesiune/i }))
    fireEvent.click(screen.getByRole('button', { name: /Încheie/i }))

    const sessions = JSON.parse(localStorage.getItem('pomodoro_sessions') ?? '[]')

    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toEqual(
      expect.objectContaining({
        completedPomodoros: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        tasks: [],
      })
    )
    expect(screen.getByText('Rezumat Sesiune')).toBeInTheDocument()
  })
})
