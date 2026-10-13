import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CitizenPortal from './views/CitizenPortal';
import AdminDashboard from './views/AdminDashboard';
import AIAssistant from './views/AIAssistant';

function MainApp() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' | 'admin' | 'ai'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'admin' && (!isAuthenticated || !isAdmin)) {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'citizen' && (
          <CitizenPortal onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        )}

        {activeTab === 'ai' && (
          <AIAssistant />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={handleTabChange} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
        onLoginSuccess={(userData) => {
          if (userData?.role === 'admin' && activeTab === 'admin') {
            setActiveTab('admin');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
