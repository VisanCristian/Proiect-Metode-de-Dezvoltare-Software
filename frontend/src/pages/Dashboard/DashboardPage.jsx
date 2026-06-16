import React, { useEffect, useState } from 'react';
import './DashboardPage.css';
import axios from 'axios';
import ActivityReport from '../../fragments/Home/ActivityReport';
import { getUserActivity } from '../../services/activity_api';

function getGreeting(username, stats) {
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17 && hour < 21) timeGreeting = 'Good evening';
    else timeGreeting = 'Burning the midnight oil';

    const name = username ? `, ${username}` : '';

    if (stats.avgDailyMin > 60) return `${timeGreeting}${name} 🔥 Incredible — averaging ${stats.avgDailyMin} min of focus per day!`;
    if (stats.avgDailyMin > 20) return `${timeGreeting}${name} 📈 Great consistency — ${stats.avgDailyMin} min/day on average this month!`;
    if (stats.allTimeTokens > 0) return `${timeGreeting}${name} ⭐ Keep building — you have ${stats.allTimeTokens} tokens earned overall!`;
    if (hour >= 21 || hour < 5) return `${timeGreeting}${name} 🌙 Don't forget to rest — consistency beats intensity.`;
    return `${timeGreeting}${name} 👋 Ready to learn something new today?`;
}

const GOALS = { focusMin: 120, cards: 50, points: 5000, tokens: 10000 };

const DashboardPage = () => {
    const [userData, setUserData] = useState({ username: '' });
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        Promise.all([
            axios.get('http://127.0.0.1:8080/api/auth/users/me/', {
                headers: { Authorization: `Token ${token}` },
            }).catch(() => ({ data: {} })),
            getUserActivity().catch(() => ({ months: [] })),
        ]).then(([userRes, activityRes]) => {
            setUserData({ username: userRes.data.username || '' });
            const months = activityRes.months || [];
            const current = months[months.length - 1] || {};
        

            const dayOfMonth = new Date().getDate();
            const currentFocusSec = current.total_focus_time || 0;
            const currentFocusMin = Math.round(currentFocusSec / 60);
            const avgDailySec = dayOfMonth > 0 ? currentFocusSec / dayOfMonth : 0;
            const avgDailyMin = avgDailySec >= 60 ? Math.round(avgDailySec / 60) : (avgDailySec > 0 ? '< 1' : 0);
            const allTimeFocusMin = Math.round(months.reduce((s, m) => s + (m.total_focus_time || 0), 0) / 60);
            const allTimeTokens = months.reduce((s, m) => s + (m.tokens || 0), 0);

            const todaySec = activityRes.today_focus || 0;
            const yesterdaySec = activityRes.yesterday_focus || 0;
            const todayMin = Math.round(todaySec / 60);
            const yesterdayMin = Math.round(yesterdaySec / 60);
            let dailyTrend = null;
            if (yesterdaySec > 0) {
                const diff = todaySec - yesterdaySec;
                const pct = Math.round((diff / yesterdaySec) * 100);
                dailyTrend = { diff, pct, up: diff >= 0, todayMin, yesterdayMin };
            } else if (todaySec > 0) {
                dailyTrend = { diff: todaySec, pct: null, up: true, todayMin, yesterdayMin: 0 };
            }

            setMetrics({
                avgDailyMin,
                allTimeFocusMin,
                allTimeTokens,
                dailyTrend,
                currentFocusMin,
                currentCards: current.total_solved_cards || 0,
                currentPoints: (current.points ?? current.flashcard_points) || 0,
                currentTokens: current.tokens || 0,
            });
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="dashboard-loading">Loading your dashboard...</div>;
    }

    const m = metrics || {};
    const greeting = getGreeting(userData.username, {
        avgDailyMin: m.avgDailyMin || 0,
        allTimeTokens: m.allTimeTokens || 0,
    });

    const statCards = [
        {
            icon: '⏱',
            label: 'Avg daily focus',
            value: `${m.avgDailyMin ?? 0} min`,
            sub: 'this month per day',
            cls: 'pomodoro-stat',
        },
        {
            icon: '📈',
            label: 'Focus trend',
            value: m.dailyTrend
                ? m.dailyTrend.pct !== null
                    ? `${m.dailyTrend.up ? '↑' : '↓'} ${Math.abs(m.dailyTrend.pct)}%`
                    : `${m.dailyTrend.todayMin} min`
                : '—',
            sub: m.dailyTrend
                ? m.dailyTrend.pct !== null
                    ? `vs yesterday (${m.dailyTrend.yesterdayMin} min)`
                    : 'no focus yesterday'
                : 'no focus today yet',
            cls: `flashcard-stat${m.dailyTrend && !m.dailyTrend.up ? ' trend-down' : ''}`,
        },
        {
            icon: '🏆',
            label: 'All-time focus',
            value: `${m.allTimeFocusMin ?? 0} min`,
            sub: 'total across all months',
            cls: 'chatbot-stat',
        },
        {
            icon: '◈',
            label: 'All-time tokens',
            value: m.allTimeTokens ?? 0,
            sub: 'earned overall',
            cls: 'tokens-stat',
        },
    ];

    const shortcuts = [
        { icon: '⏱', label: 'Pomodoro', desc: 'Start a focus session', href: '/pomodoro' },
        { icon: '🃏', label: 'Flashcards', desc: 'Review your decks', href: '/flashcards' },
        { icon: '📁', label: 'Files', desc: 'Browse your notes', href: '/filetree' },
        { icon: '👥', label: 'Groups', desc: 'Study with others', href: '/group' },
    ];

    const goals = [
        { label: 'Focus time', current: m.currentFocusMin || 0, goal: GOALS.focusMin, unit: 'min', color: '#e06469' },
        { label: 'Cards solved', current: m.currentCards || 0, goal: GOALS.cards, unit: 'cards', color: '#5b8fb9' },
        { label: 'Points earned', current: m.currentPoints || 0, goal: GOALS.points, unit: 'pts', color: '#4ecdc4' },
        { label: 'Tokens', current: m.currentTokens || 0, goal: GOALS.tokens, unit: 'tokens', color: '#f5c842' },
    ];

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>{greeting}</h1>
                <p className="dashboard-subtext">Here's your learning overview for this month.</p>
            </header>

            <div className="stats-grid">
                {statCards.map(card => (
                    <div key={card.label} className={`stat-card ${card.cls}`}>
                        <div className="stat-icon">{card.icon}</div>
                        <div className="stat-info">
                            <span className="stat-label">{card.label}</span>
                            <span className="stat-value">{card.value}</span>
                            <span className="stat-sub">{card.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-shortcuts">
                {shortcuts.map(s => (
                    <a key={s.label} href={s.href} className="shortcut-card">
                        <span className="shortcut-icon">{s.icon}</span>
                        <span className="shortcut-label">{s.label}</span>
                        <span className="shortcut-desc">{s.desc}</span>
                    </a>
                ))}
            </div>

            <div className="monthly-goals">
                <h2 className="monthly-goals__title">Monthly Goals</h2>
                <div className="monthly-goals__grid">
                    {goals.map(g => {
                        const pct = Math.min(100, g.goal > 0 ? Math.round((g.current / g.goal) * 100) : 0);
                        return (
                            <div key={g.label} className="goal-item">
                                <div className="goal-item__header">
                                    <span className="goal-item__label">{g.label}</span>
                                    <span className="goal-item__count">{g.current} / {g.goal} {g.unit}</span>
                                </div>
                                <div className="goal-item__bar-bg">
                                    <div
                                        className="goal-item__bar-fill"
                                        style={{ width: `${pct}%`, background: g.color }}
                                    />
                                </div>
                                <span className="goal-item__pct">{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <main className="dashboard-content">
                <ActivityReport mode="personal" />
            </main>
        </div>
    );
};

export default DashboardPage;
