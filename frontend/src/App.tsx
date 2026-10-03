import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { DashboardPage } from './pages/DashboardPage';
import { AIHelpdeskPage } from './pages/AIHelpdeskPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { AutomationPage } from './pages/AutomationPage';
import { SoftwarePage } from './pages/SoftwarePage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const handleNavigate = (tab: string, ticketId?: string) => {
    if (ticketId) {
      setSelectedTicketId(ticketId);
      setCurrentTab('ticket-detail');
    } else {
      setCurrentTab(tab);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'ai-helpdesk':
        return <AIHelpdeskPage onNavigate={handleNavigate} />;
      case 'tickets':
        return <TicketsPage onSelectTicket={(id) => handleNavigate('ticket-detail', id)} />;
      case 'ticket-detail':
        return <TicketDetailPage ticketId={selectedTicketId || 'INC001001'} onBack={() => setCurrentTab('tickets')} />;
      case 'ai-analysis':
        return <AIAnalysisPage />;
      case 'knowledge-base':
        return <KnowledgeBasePage />;
      case 'automation':
        return <AutomationPage />;
      case 'software-requests':
        return <SoftwarePage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header servicenowMode="MOCK" />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
