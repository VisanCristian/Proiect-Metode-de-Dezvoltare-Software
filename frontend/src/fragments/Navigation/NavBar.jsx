import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/Auth/useAuth';
import './NavBar.css';

const NavBar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="global-navbar">
            <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
                <span className="navbar-logo">StudyAPP</span>
            </div>
            
            <div className="navbar-links">
                <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    Dashboard
                </NavLink>
                <NavLink to="/pomodoro" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    Pomodoro
                </NavLink>
                <NavLink to="/flashcards" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    FlashCards
                </NavLink>
                <NavLink to="/filetree" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    FileTree
                </NavLink>
                <NavLink to="/group" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    Groups
                </NavLink>
            </div>

            <div className="navbar-actions">
                <button onClick={handleLogout} className="navbar-logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default NavBar;
