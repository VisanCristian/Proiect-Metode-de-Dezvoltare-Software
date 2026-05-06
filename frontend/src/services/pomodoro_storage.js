const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/pomodoro'

function buildUrl(path) {
  return `${API_BASE_URL}${path}`
}

function extractErrorMessage(payload) {
  if (!payload) return 'Request failed.'
  if (typeof payload.detail === 'string') return payload.detail
  if (typeof payload === 'string') return payload
  if (Array.isArray(payload)) return payload.join(', ')

  return Object.values(payload)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .join(', ')
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload) || 'Request failed.')
  }

  return payload
}

function toTimestamp(value) {
  return value ? new Date(value).getTime() : null
}

function toIsoString(value) {
  return value ? new Date(value).toISOString() : null
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    estimatedPomodoros: task.estimated_pomodoros,
    actualPomodoros: task.actual_pomodoros,
    completed: task.completed,
    order: task.display_order,
  }
}

function normalizeSettings(session) {
  return {
    FOCUS_TIME: session.focus_time,
    BREAK_TIME: session.break_time,
    LONG_BREAK_TIME: session.long_break_time,
    CYCLES_BEFORE_LONG_BREAK: session.cycles_before_long_break,
    AUTO_START: session.auto_start,
  }
}

function normalizeSession(session) {
  return {
    id: session.id,
    status: session.status,
    startTime: toTimestamp(session.start_time),
    endTime: toTimestamp(session.end_time),
    totalFocusTime: session.total_focus_time,
    totalBreakTime: session.total_break_time,
    completedPomodoros: session.completed_pomodoros,
    points: session.points,
    settings: normalizeSettings(session),
    tasks: (session.tasks ?? []).map(normalizeTask),
  }
}

function serializeSettings(settings) {
  return {
    focus_time: settings.FOCUS_TIME,
    break_time: settings.BREAK_TIME,
    long_break_time: settings.LONG_BREAK_TIME,
    cycles_before_long_break: settings.CYCLES_BEFORE_LONG_BREAK,
    auto_start: settings.AUTO_START,
  }
}

function serializeTaskCreate(task, sessionId) {
  return {
    id: task.id,
    session_id: sessionId,
    title: task.title,
    estimated_pomodoros: task.estimatedPomodoros,
    actual_pomodoros: task.actualPomodoros,
    completed: task.completed,
    display_order: task.order,
  }
}

function serializeTaskUpdate(task) {
  return {
    title: task.title,
    estimated_pomodoros: task.estimatedPomodoros,
    actual_pomodoros: task.actualPomodoros,
    completed: task.completed,
    display_order: task.order,
  }
}

const pomodoroStorage = {
  async getCurrentSession() {
    const payload = await request('/sessions/current/')
    return normalizeSession(payload)
  },

  async saveSettings(sessionId, settings) {
    const payload = await request(`/sessions/${sessionId}/`, {
      method: 'PATCH',
      body: JSON.stringify(serializeSettings(settings)),
    })

    return normalizeSession(payload)
  },

  async getTasks(sessionId) {
    const payload = await request(`/tasks/?session_id=${sessionId}`)
    return payload.map(normalizeTask)
  },

  async saveTasks(sessionId, tasks) {
    const existingTasks = await this.getTasks(sessionId)
    const existingById = new Map(existingTasks.map((task) => [task.id, task]))

    for (const task of tasks) {
      if (existingById.has(task.id)) {
        await request(`/tasks/${task.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(serializeTaskUpdate(task)),
        })
      } else {
        await request('/tasks/', {
          method: 'POST',
          body: JSON.stringify(serializeTaskCreate(task, sessionId)),
        })
      }
    }

    for (const task of existingTasks) {
      if (!tasks.some((candidate) => candidate.id === task.id)) {
        await request(`/tasks/${task.id}/`, {
          method: 'DELETE',
        })
      }
    }

    await request('/tasks/reorder/', {
      method: 'POST',
      body: JSON.stringify({
        tasks: tasks.map((task, index) => ({
          id: task.id,
          display_order: task.order ?? index,
        })),
      }),
    })

    return this.getTasks(sessionId)
  },

  async getSessions() {
    const payload = await request('/sessions/')
    return payload.map(normalizeSession)
  },

  async startSession(sessionId) {
    const payload = await request(`/sessions/${sessionId}/start/`, {
      method: 'POST',
    })

    return normalizeSession(payload)
  },

  async saveSession(sessionId, summary) {
    const payload = await request(`/sessions/${sessionId}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'ended',
        start_time: toIsoString(summary.startTime),
        end_time: toIsoString(summary.endTime),
        total_focus_time: summary.totalFocusTime,
        total_break_time: summary.totalBreakTime,
        completed_pomodoros: summary.completedPomodoros,
        points: summary.points,
      }),
    })

    return normalizeSession(payload)
  },

  async abandonSession(sessionId) {
    const payload = await request(`/sessions/${sessionId}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'abandoned',
        end_time: new Date().toISOString(),
      }),
    })

    return normalizeSession(payload)
  },

  async clearSessions() {
    await request('/sessions/clear/', {
      method: 'DELETE',
    })
  },
}

export default pomodoroStorage
