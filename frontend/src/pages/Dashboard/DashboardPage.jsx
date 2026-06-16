import React, { useEffect, useState } from 'react';
import './DashboardPage.css';
import axios from 'axios';
import ActivityReport from '../../fragments/Home/ActivityReport';

const DashboardPage = () => {
    const [userData, setUserData] = useState({ username: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://127.0.0.1:8080/api/auth/users/me/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                
                setUserData({ username: response.data.username });
            } catch (err) {
                console.error("Failed to fetch user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div className="dashboard-loading">Loading your dashboard...</div>;
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Welcome back, {userData.username || 'User'}!</h1>
                <p>Here is an overview of your recent learning activity and overall progress.</p>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-activity">
                    <ActivityReport mode="personal" />
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;
