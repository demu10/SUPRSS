// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css'; // tes styles pour layout + sidebar

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> {/* Ici seront rendus les composants des routes */}
      </main>
    </div>
  );
}
