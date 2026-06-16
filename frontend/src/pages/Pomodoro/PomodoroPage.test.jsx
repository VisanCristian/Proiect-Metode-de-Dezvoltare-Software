import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import PomodoroPage from './PomodoroPage'
import { PomodoroProvider } from '../../context/PomodoroContext'

vi.mock('../../fragments/CrossModule/FlashCardWidget', () => ({
  default: () => null,
}))

vi.mock('../../fragments/CrossModule/FileTreeWidget', () => ({
  default: () => null,
}))

vi.mock('../../fragments/CrossModule/FlashCardWidget', () => ({
  default: () => null,
}))

vi.mock('../../fragments/CrossModule/FileTreeWidget', () => ({
  default: () => null,
}))

vi.mock('../../fragments/CrossModule/FlashCardWidget', () => ({
  default: () => null,
}))

vi.mock('../../fragments/CrossModule/FileTreeWidget', () => ({
  default: () => null,
}))

vi.mock('../../hooks/useSound', () => ({
  default: () => ({ playForPhase: vi.fn() }),
}))

vi.mock('../../hooks/useBrowserNotification', () => ({
  default: () => ({ notify: vi.fn() }),
}))

vi.mock('../../hooks/useBeforeUnload', () => ({
  default: () => undefined,
}))

function jsonResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
}

function buildSession(session, tasks) {
  return {
    ...session,
    tasks: tasks
      .filter((task) => task.session_id === session.id)
      .sort((left, right) => left.display_order - right.display_order),
  }
}

function createBackendMock({ focusTime = 25 * 60 } = {}) {
  const state = {
    currentSession: {
      id: 'session-1',
      start_time: null,
      end_time: null,
      status: 'draft',
      focus_time: focusTime,
      break_time: 5 * 60,
      long_break_time: 15 * 60,
      cycles_before_long_break: 4,
      auto_start: false,
      total_focus_time: 0,
      total_break_time: 0,
      completed_pomodoros: 0,
      points: 0,
      created_at: '2026-05-05T18:00:00.000Z',
      updated_at: '2026-05-05T18:00:00.000Z',
    },
    history: [],
    tasks: [],
    nextSessionId: 2,
  }

  globalThis.fetch.mockImplementation(async (url, options = {}) => {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname.replace('/api/pomodoro', '')
    const method = options.method ?? 'GET'
    const body = options.body ? JSON.parse(options.body) : null

    if (method === 'GET' && path === '/sessions/current/') {
      return jsonResponse(buildSession(state.currentSession, state.tasks))
    }

    if (method === 'GET' && path === '/sessions/') {
      return jsonResponse(state.history.map((session) => buildSession(session, state.tasks)))
    }

    if (method === 'PATCH' && path === `/sessions/${state.currentSession.id}/`) {
      if (body.status === 'ended') {
        const endedSession = {
          ...state.currentSession,
          ...body,
          status: 'ended',
          updated_at: '2026-05-05T18:30:00.000Z',
        }
        state.history.push(endedSession)
        state.currentSession = {
          id: `session-${state.nextSessionId}`,
          start_time: null,
          end_time: null,
          status: 'draft',
          focus_time: endedSession.focus_time,
          break_time: endedSession.break_time,
          long_break_time: endedSession.long_break_time,
          cycles_before_long_break: endedSession.cycles_before_long_break,
          auto_start: endedSession.auto_start,
          total_focus_time: 0,
          total_break_time: 0,
          completed_pomodoros: 0,
          points: 0,
          created_at: '2026-05-05T18:31:00.000Z',
          updated_at: '2026-05-05T18:31:00.000Z',
        }
        state.nextSessionId += 1
        return jsonResponse(endedSession)
      }

      if (body.status === 'abandoned') {
        state.currentSession = {
          ...state.currentSession,
          status: 'draft',
          start_time: null,
          end_time: null,
          total_focus_time: 0,
          total_break_time: 0,
          completed_pomodoros: 0,
          points: 0,
        }
        return jsonResponse(buildSession(state.currentSession, state.tasks))
      }

      state.currentSession = {
        ...state.currentSession,
        ...body,
        updated_at: '2026-05-05T18:10:00.000Z',
      }
      return jsonResponse(buildSession(state.currentSession, state.tasks))
    }

    if (method === 'POST' && path === `/sessions/${state.currentSession.id}/start/`) {
      state.currentSession = {
        ...state.currentSession,
        status: 'active',
        start_time: '2026-05-05T18:05:00.000Z',
      }
      return jsonResponse(buildSession(state.currentSession, state.tasks))
    }

    if (method === 'GET' && path === '/tasks/') {
      const sessionId = parsedUrl.searchParams.get('session_id')
      return jsonResponse(
        state.tasks
          .filter((task) => task.session_id === sessionId)
          .sort((left, right) => left.display_order - right.display_order)
      )
    }

    if (method === 'POST' && path === '/tasks/') {
      state.tasks.push({
        ...body,
        created_at: '2026-05-05T18:07:00.000Z',
        updated_at: '2026-05-05T18:07:00.000Z',
      })
      return jsonResponse(body, 201)
    }

    const taskMatch = path.match(/^\/tasks\/([^/]+)\/$/)
    if (taskMatch && method === 'PATCH') {
      const [, taskId] = taskMatch
      state.tasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...body, updated_at: '2026-05-05T18:08:00.000Z' } : task
      )
      return jsonResponse(state.tasks.find((task) => task.id === taskId))
    }

    if (taskMatch && method === 'DELETE') {
      const [, taskId] = taskMatch
      state.tasks = state.tasks.filter((task) => task.id !== taskId)
      return jsonResponse({}, 204)
    }

    if (method === 'POST' && path === '/tasks/reorder/') {
      state.tasks = state.tasks.map((task) => {
        const nextOrder = body.tasks.find((item) => item.id === task.id)
        return nextOrder ? { ...task, display_order: nextOrder.display_order } : task
      })
      return jsonResponse({}, 204)
    }

    if (method === 'DELETE' && path === '/sessions/clear/') {
      state.history = []
      return jsonResponse({}, 204)
    }

    throw new Error(`Unhandled request: ${method} ${path}`)
  })

  return state
}

describe('PomodoroPage', () => {
  beforeEach(() => {
    vi.useRealTimers()
    globalThis.fetch.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('starts a session with the most recently saved settings', async () => {
    createBackendMock()

    render(<PomodoroProvider><PomodoroPage /></PomodoroProvider>)

    fireEvent.change(await screen.findByLabelText('Focus (min)'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    fireEvent.click(await screen.findByRole('button', { name: /Start Session/i }))

    expect(await screen.findByText('30:00')).toBeInTheDocument()
  })

  it('starts the initial timer automatically when auto-start is enabled in settings', async () => {
    createBackendMock()

    render(<PomodoroProvider><PomodoroPage /></PomodoroProvider>)

    fireEvent.click(await screen.findByLabelText('Auto-start'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    fireEvent.click(await screen.findByRole('button', { name: /Start Session/i }))

    expect(await screen.findByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('advances the session and keeps the active task after starting', async () => {
    createBackendMock({ focusTime: 1 })

    render(<PomodoroProvider><PomodoroPage /></PomodoroProvider>)

    fireEvent.change(await screen.findByPlaceholderText('Add a task...'), { target: { value: 'Capitol 1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))
    fireEvent.click(screen.getByText('Capitol 1'))
    fireEvent.click(screen.getByRole('button', { name: /Start Session/i }))
    fireEvent.click(await screen.findByRole('button', { name: 'Start' }))

    await waitFor(() => {
      expect(screen.getByText('Capitol 1')).toBeInTheDocument()
      expect(screen.getByText('00:01')).toBeInTheDocument()
    })
  })

  it('keeps progress separate from the task checkbox', async () => {
    createBackendMock()

    render(<PomodoroProvider><PomodoroPage /></PomodoroProvider>)

    fireEvent.change(await screen.findByPlaceholderText('Add a task...'), { target: { value: 'sa fac ceva' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }))

    await waitFor(() => {
      expect(screen.getAllByText('sa fac ceva')).toHaveLength(1)
      expect(screen.getByText('0/1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('sa fac ceva').closest('.task-item').querySelector('.task-checkbox'))
    expect(await screen.findByText('0/1')).toBeInTheDocument()
  })

  it('saves the session through the API when it ends', async () => {
    const backendState = createBackendMock()

    render(<PomodoroProvider><PomodoroPage /></PomodoroProvider>)

    fireEvent.click(await screen.findByRole('button', { name: /Start Session/i }))
    fireEvent.click(await screen.findByRole('button', { name: /Finish/i }))

    await waitFor(() => {
      expect(backendState.history).toHaveLength(1)
    })

    expect(backendState.history[0]).toEqual(
      expect.objectContaining({
        status: 'ended',
        completed_pomodoros: 0,
        total_focus_time: 0,
        total_break_time: 0,
      })
    )
    expect(await screen.findByText('Session Summary')).toBeInTheDocument()
  })
})
