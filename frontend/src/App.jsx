import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BrowseCatalog } from './pages/BrowseCatalog';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { MyDashboard } from './pages/MyDashboard';
import { AdminDeskHub } from './pages/AdminDeskHub';
import { ReportItemModal } from './components/ReportItemModal';
import { AuthModal } from './components/AuthModal';
import { ShieldCheck, Heart, Github } from 'lucide-react';

function MainLayout() {
  const [currentView, setView] = useState('catalog'); // 'catalog' | 'item-details' | 'my-dashboard' | 'admin-hub'
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectItem = (item) => {
    setSelectedItemId(item._id);
    setView('item-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemCreated = (newItem) => {
    setSelectedItemId(newItem._id);
    setView('item-details');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setView={setView}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'catalog' && (
          <BrowseCatalog
            onSelectItem={handleSelectItem}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {currentView === 'item-details' && (
          <ItemDetailsPage
            itemId={selectedItemId}
            onBack={() => setView('catalog')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'my-dashboard' && (
          <MyDashboard
            onSelectItem={handleSelectItem}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {currentView === 'admin-hub' && (
          <AdminDeskHub onSelectItem={handleSelectItem} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight">
              FindBack Campus
            </span>
            <span>— End-Term Software Engineering Project</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Fraud & Cryptographic OTP Handover</span>
            </span>
            <span className="text-slate-400">|</span>
            <span>MERN Stack Architecture</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportItemModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onItemCreated={handleItemCreated}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
