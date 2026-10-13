import React from 'react';
import { Leaf, Heart, Shield, Radio, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../services/api';

export default function Footer({ setActiveTab }) {
  const currentYear = new Date().getFullYear();
  const apiUrl = getApiBaseUrl();

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-backdrop)',
      WebkitBackdropFilter: 'var(--glass-backdrop)',
      padding: '40px 0 24px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Leaf size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem' }}>
                EcoCivic AI
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '320px' }}>
              Empowering citizens and municipal officers with intelligent grievance triage, automated environmental prioritization, and real-time remediation tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-main)' }}>Platform Modules</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <button 
                onClick={() => setActiveTab('citizen')} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                Citizen Reporting Portal
              </button>
              <button 
                onClick={() => setActiveTab('admin')} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                Admin Command Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('ai')} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                Gemini Advisory AI
              </button>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-main)' }}>Enterprise Stack</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge badge-eco" style={{ fontSize: '0.74rem' }}>Java Spring Boot 3</span>
              <span className="badge badge-eco" style={{ fontSize: '0.74rem' }}>React 19 + Vite</span>
              <span className="badge badge-eco" style={{ fontSize: '0.74rem' }}>Google Gemini AI</span>
              <span className="badge badge-eco" style={{ fontSize: '0.74rem' }}>Chart.js Analytics</span>
              <span className="badge badge-eco" style={{ fontSize: '0.74rem' }}>Render Cloud</span>
            </div>
          </div>

          {/* Connected API Status */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-main)' }}>API Gateway</h4>
            <div style={{
              background: 'var(--bg-surface)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-main)' }}>
                <Radio size={14} color="var(--color-primary)" />
                <span>Backend Gateway:</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--color-accent)' }}>
                {apiUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-subtle)'
        }}>
          <div>
            &copy; {currentYear} EcoCivic AI Foundation. Dedicated to urban ecological sustainability.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Built for civic excellence</span>
            <Heart size={14} color="#f43f5e" fill="#f43f5e" />
          </div>
        </div>
      </div>
    </footer>
  );
}
