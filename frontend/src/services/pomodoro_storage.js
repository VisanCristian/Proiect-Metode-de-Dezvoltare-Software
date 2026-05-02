const KEY = {
    SETTINGS: 'pomodoro_settings',
    SESSIONS: 'pomodoro_sessions',
    TASKS: 'pomodoro_tasks',
}

const pomodoroStorage = {
    getSettings() {
        const data = localStorage.getItem(KEY.SETTINGS);
        return data ? JSON.parse(data) : null;
    },
    saveSettings(settings) {
        localStorage.setItem(KEY.SETTINGS, JSON.stringify(settings));
    },
    getSessions() {
        const data = localStorage.getItem(KEY.SESSIONS);
        return data ? JSON.parse(data) : [];
    },
    saveSession(session) {
        const sessions = this.getSessions();
        sessions.push(session);
        localStorage.setItem(KEY.SESSIONS, JSON.stringify(sessions));
    },
    getTasks() {
        const data = localStorage.getItem(KEY.TASKS);
        return data ? JSON.parse(data) : [];
    },
    saveTasks(tasks) {
        localStorage.setItem(KEY.TASKS, JSON.stringify(tasks));
    },
    clearSessions() {
        localStorage.setItem(KEY.SESSIONS, JSON.stringify([]));
    }
}

export default pomodoroStorage;
