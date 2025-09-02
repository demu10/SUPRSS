// src/components/Sidebar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Sidebar.css';
import logo from '../assets/logo.png';
import avatarImg from '../assets/avatar.png';

export default function Sidebar() {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logo} alt="Logo SUPRSS" className="app-logo" />
        <h2 className="app-name">SUPRSS</h2>
      </div>

      <nav className="tabs-pane">
        <ul className="tabs-nav">
          <li><Link to="/home">🏠 Accueil</Link></li>
          <li><Link to="/dashboard">📊 Dashboard</Link></li>
          <li><Link to="/collections">📚 Collections</Link></li>
          <li><Link to="/feeds">📰 Flux</Link></li>
          <li><Link to="/favorites">⭐ Favoris</Link></li>  
          <li><Link to="/automation">⚙️ Automatisation</Link></li>
          <li><Link to="/search">🔍 Recherche</Link></li>
          {/* <li><Link to="/add-feed">➕ Ajouter un flux</Link></li> */}
          <li><Link to="/import">📥 Importer</Link></li>
          <li><Link to="/export">📤 Exporter</Link></li>
          <li><Link to="/messaging">💬 Messagerie</Link></li>
          <li><Link to="/preferences">⚙️ Préférences</Link></li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <img src={avatarImg} alt="Avatar" className="avatar" />
        <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
      </div>
    </div>
  );
}