import React, { useEffect, useState } from 'react';
import { getUserActivity } from '../../services/activity_api';
import './ActivityReport.css';

const TITLES = {
    personal: 'My Activity',
    grup: 'Group Activity',
};

const ActivityReport = ({ mode = 'personal', groupId = null }) => {
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activityData, setActivityData] = useState(null);

    useEffect(() => {
        getUserActivity()
            .then((data) => {
                setMonths(data.months || []);
                setActivityData(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="activity-report">Loading activity...</div>;
    }

    if (error) {
        return <div className="activity-report activity-report--error">{error}</div>;
    }

    return (
        <div className={`activity-report activity-report--${mode}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="activity-report__title">{TITLES[mode]}</h3>
                {activityData && (
                    <div style={{ 
                        background: 'var(--accent)', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                    }}>
                        {activityData.available_tokens} Available Tokens
                    </div>
                )}
            </div>

            {months.length === 0 ? (
                <p className="activity-report__empty">No activity recorded yet.</p>
            ) : (
                <ul className="activity-report__list">
                    {months.map((item) => (
                        <li key={item.month} className="activity-report__item">
                            <span className="activity-report__month">{item.month}</span>
                            <span className="activity-report__stat activity-report__stat--focus">
                                ⏱ {Math.round(item.total_focus_time / 60)} min focus
                            </span>
                            <span className="activity-report__stat activity-report__stat--cards">
                                🃏 {item.total_solved_cards} cards
                            </span>
                            <span className="activity-report__stat activity-report__stat--pts">
                                ★ {item.flashcard_points} pts
                            </span>
                            <span className="activity-report__stat activity-report__stat--tokens">
                                ◈ {item.tokens} tokens
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ActivityReport;
