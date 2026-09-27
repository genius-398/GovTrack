/**
 * GovTrack - Real-Time Government Document Processing & Tracking System
 * Main Application Component
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Header } from './components/common/Header.tsx';
import { CitizenDashboard } from './components/citizen/CitizenDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { CivicInformationSections } from './components/common/CivicInformationSections.tsx';
import { OfficialSeal } from './components/common/OfficialSeal.tsx';

function MainApp() {
  const [currentView, setCurrentView] = useState<'citizen' | 'admin'>('citizen');
  const currentCitizenId = 'user-citizen-01';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar with Dark/Light Toggle */}
      <Header
        currentView={currentView}
        onSwitchView={(view) => setCurrentView(view)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {currentView === 'citizen' ? (
          <CitizenDashboard
            currentUserId={currentCitizenId}
            onSwitchToAdmin={() => setCurrentView('admin')}
          />
        ) : (
          <AdminDashboard
            currentOfficerName="Officer Marcus Vance"
            currentBadgeNumber="CRB-8812"
            onViewCitizenPortal={() => setCurrentView('citizen')}
          />
        )}

        {/* SOP Milestones, Department Directory & Compliance Information */}
        <CivicInformationSections />
      </main>

      {/* Quiet Civic Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <OfficialSeal size={20} />
            <span className="font-semibold text-slate-800 dark:text-slate-200">GovTrack Civic Infrastructure</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Digital Public Services Administration</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Official Government Services Platform</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} GovTrack</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
