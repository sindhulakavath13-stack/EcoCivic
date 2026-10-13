import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  BarChart3, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Radio, 
  Settings,
  LogIn
} from 'lucide-react';
import { checkBackendHealth, getApiBaseUrl, setApiBaseUrl } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('ecocivic_theme') || 'dark');
  const [isBackendLive, setIsBackendLive] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(getApiBaseUrl());

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('ecocivic_theme', theme);
  }, [theme]);

  // Periodic health check
  useEffect(() => {
    let mounted = true;
    const testHealth = async () => {
      const ok = await checkBackendHealth();
      if (mounted) setIsBackendLive(ok);
    };
    testHealth();
    const interval = setInterval(testHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiBaseUrl(customApiUrl);
    setShowSettingsModal(false);
    window.location.reload();
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-backdrop)',
        WebkitBackdropFilter: 'var(--glass-backdrop)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'all var(--transition-normal)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
          gap: '16px'
        }}>
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('citizen')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              color: '#ffffff'
            }}>
              <Leaf size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontWeight: 800, 
                  fontSize: '1.35rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-main)'
                }}>
                  EcoCivic
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em'
                }}>
                  AI
                </span>
              </div>
              <p style={{ 
                fontSize: '0.74rem', 
                color: 'var(--text-subtle)', 
                lineHeight: 1, 
                marginTop: '2px',
                display: 'none',
                sm: 'block'
              }}>
                Smart Sustainability Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('citizen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: activeTab === 'citizen' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'citizen' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: activeTab === 'citizen' ? 'var(--shadow-glow)' : 'none',
                transition: 'all var(--transition-normal)'
              }}
            >
              <Leaf size={16} />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: activeTab === 'admin' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'admin' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: activeTab === 'admin' ? 'var(--shadow-glow)' : 'none',
                transition: 'all var(--transition-normal)'
              }}
            >
              <BarChart3 size={16} />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: activeTab === 'ai' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
                color: activeTab === 'ai' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: activeTab === 'ai' ? 'var(--shadow-glow-accent)' : 'none',
                transition: 'all var(--transition-normal)'
              }}
            >
              <Sparkles size={16} />
              <span>AI Assistant</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Backend status indicator */}
            <div 
              title={isBackendLive ? 'Backend Online (Render / Spring Boot)' : 'Connecting to Backend...'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              onClick={() => setShowSettingsModal(true)}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isBackendLive ? '#10b981' : '#f59e0b',
                boxShadow: isBackendLive ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                display: 'inline-block'
              }} />
              <span style={{ display: 'none', md: 'inline' }}>
                {isBackendLive ? 'Live API' : 'Checking...'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost"
              style={{ padding: '8px', borderRadius: '50%' }}
              aria-label="Toggle dark/light theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
            </button>

            {/* User Session Profile / Login */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isAdmin ? 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)' : 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isAdmin ? '#ffffff' : 'var(--color-primary)'
                  }}>
                    {isAdmin ? <ShieldCheck size={16} /> : <UserIcon size={15} />}
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {user.name || user.email?.split('@')[0]}
                    </div>
                    <div style={{ 
                      fontSize: '0.68rem', 
                      color: isAdmin ? 'var(--priority-high)' : 'var(--color-primary)', 
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {user.role || 'Citizen'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px', padding: '8px 18px' }}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Backend Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Settings size={22} color="var(--color-primary)" />
              <h3 style={{ margin: 0 }}>API & Backend Configuration</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px' }}>
              EcoCivic AI is configured to connect to the production Spring Boot API on Render. You can inspect or update the endpoint below.
            </p>
            <form onSubmit={handleSaveApiUrl}>
              <div className="form-group">
                <label className="form-label">Backend API Base URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://ecocivic.onrender.com/api"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setCustomApiUrl('https://ecocivic.onrender.com/api')}
                >
                  Reset to Render
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setCustomApiUrl('http://127.0.0.1:8080/api')}
                >
                  Localhost (8080)
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowSettingsModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply & Reload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
