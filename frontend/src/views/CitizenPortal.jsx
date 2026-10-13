import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchMyReports, submitReport } from '../services/api';
import ReportModal from '../components/ReportModal';
import confetti from 'canvas-confetti';
import { 
  PlusCircle, 
  MapPin, 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Compass, 
  Leaf, 
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function CitizenPortal({ onOpenAuthModal }) {
  const { user, isAuthenticated } = useAuth();
  const { success, error, warning, info } = useToast();

  // Complaints State
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);

  // Load user complaints
  const loadReports = async () => {
    if (!isAuthenticated) return;
    setLoadingReports(true);
    try {
      const data = await fetchMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load my reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
    } else {
      setReports([]);
    }
  }, [isAuthenticated]);

  // Handle Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    info('Detecting your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`;
        setLocation(coords);
        setDetectingLocation(false);
        success('Location detected successfully!');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setDetectingLocation(false);
        warning('Could not retrieve GPS location. Please enter your address or landmark manually.');
      },
      { timeout: 8000 }
    );
  };

  // Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      warning('Please sign in or create an account to file an official grievance.');
      onOpenAuthModal();
      return;
    }

    if (!description.trim() || !location.trim()) {
      error('Please provide both a description and location.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      if (title.trim()) formData.append('title', title.trim());
      if (imageFile) formData.append('image', imageFile);

      await submitReport(formData);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      success('Grievance filed! EcoCivic AI is classifying and prioritizing your case.');

      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      clearImage();

      // Refresh list
      loadReports();
    } catch (err) {
      console.error('Submission error:', err);
      error(err.message || 'Unable to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick prompt presets
  const applyPreset = (promptText, locText) => {
    setDescription(promptText);
    if (locText) setLocation(locText);
  };

  // Compute profile statistics
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'Pending').length;
  const inProgressCount = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  // Filter complaints
  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (r.title && r.title.toLowerCase().includes(s)) ||
      (r.description && r.description.toLowerCase().includes(s)) ||
      (r.location && r.location.toLowerCase().includes(s)) ||
      (r.category && r.category.toLowerCase().includes(s)) ||
      (r.sustainabilityArea && r.sustainabilityArea.toLowerCase().includes(s));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        padding: '48px 0 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-light)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--color-primary)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '18px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <Sparkles size={16} />
          <span>AI-Powered Municipal Sustainability Intelligence</span>
        </div>

        <h1 style={{ marginBottom: '16px' }}>
          Report Civic Grievances. <br />
          <span className="gradient-text">Catalyze Ecological Remediation.</span>
        </h1>

        <p style={{
          maxWidth: '680px',
          margin: '0 auto 28px',
          color: 'var(--text-muted)',
          fontSize: '1.05rem',
          lineHeight: 1.6
        }}>
          Every report you submit is analyzed by Google Gemini AI, classified into sustainability categories, 
          assigned an urgency score, and tracked transparently to resolution.
        </p>

        {/* User Stats Overview (if logged in) */}
        {isAuthenticated ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            maxWidth: '860px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Grievances</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {totalCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', marginTop: '2px' }}>Total Submitted</div>
            </div>

            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Review</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-pending)', marginTop: '4px' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Awaiting Dispatch</div>
            </div>

            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Progress</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-inprogress)', marginTop: '4px' }}>
                {inProgressCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Remediation Underway</div>
            </div>

            <div className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved Cases</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-resolved)', marginTop: '4px' }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', marginTop: '2px' }}>Completed & Verified</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', gap: '12px' }}>
            <button onClick={onOpenAuthModal} className="btn btn-primary btn-lg">
              <span>Sign In to Track Grievances</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Main Grid: Form on Left, Grievance Tracker on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '32px',
        marginTop: '24px'
      }}>
        {/* Report Submission Box */}
        <div>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <PlusCircle size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Report an Issue</h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Automated AI Categorization</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Describe the problem clearly. You can attach photographic evidence and pin your precise location.
            </p>

            {/* Quick Template Chips */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                Quick Complaint Templates:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => applyPreset('Hazardous garbage dumped near community lake and water reservoir', 'Lake View Park, Sector 4')}
                >
                  🌊 Water Reservoir Dump
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => applyPreset('Illegal tree cutting and destruction of green belt along highway', 'Outer Ring Road, KM 14')}
                >
                  🌳 Green Belt Felling
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => applyPreset('Open toxic burning of plastic waste creating hazardous smoke', 'Industrial Area, Phase 2')}
                >
                  🔥 Plastic Burning
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Subject / Title (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hazardous chemical smell or overflowing bin"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grievance Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what you observed, estimated volume, and environmental risk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Incident Location *</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Compass size={14} />
                    <span>{detectingLocation ? 'Locating...' : 'Use My GPS'}</span>
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. 5th Cross Road, Near Central Botanical Garden"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  <MapPin size={17} color="var(--text-subtle)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Photo Evidence Upload */}
              <div className="form-group">
                <label className="form-label">Photo Evidence (Optional, max 5MB)</label>
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--bg-surface)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <UploadCloud size={32} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Click or drag to upload photo
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                      PNG, JPG, WEBP up to 5MB
                    </div>
                  </div>
                ) : (
                  <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: '#000000'
                  }}>
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(244, 63, 94, 0.9)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px',
                        cursor: 'pointer'
                      }}
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px', padding: '14px' }}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Submitting & AI Analyzing...</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Leaf size={18} />
                    <span>Submit Sustainability Complaint</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* My Complaints Activity Feed */}
        <div>
          <div className="glass-card" style={{ padding: '32px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>My Complaints</h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {isAuthenticated ? `${reports.length} total cases recorded` : 'Sign in to see your grievance history'}
                </span>
              </div>
              <button
                onClick={loadReports}
                disabled={loadingReports || !isAuthenticated}
                className="btn btn-ghost btn-sm"
                title="Refresh complaints"
              >
                {loadingReports ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Filter Tabs & Search */}
            {isAuthenticated && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  background: 'var(--bg-surface)',
                  padding: '4px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '12px'
                }}>
                  {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: statusFilter === st ? 'var(--bg-card-solid)' : 'transparent',
                        color: statusFilter === st ? 'var(--color-primary)' : 'var(--text-muted)',
                        boxShadow: statusFilter === st ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px', padding: '8px 12px 8px 36px', fontSize: '0.86rem' }}
                    placeholder="Search by keyword, location, or area..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            )}

            {/* Complaint List Items */}
            {!isAuthenticated ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: 'var(--text-muted)'
              }}>
                <ShieldAlert size={44} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Sign In Required</h3>
                <p style={{ fontSize: '0.88rem', maxWidth: '320px', margin: '0 auto 18px' }}>
                  Sign in or register an account to view and monitor the resolution progress of your submitted complaints.
                </p>
                <button onClick={onOpenAuthModal} className="btn btn-primary btn-sm">
                  Sign In Now
                </button>
              </div>
            ) : loadingReports ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '90px' }} />
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)'
              }}>
                <Leaf size={40} color="var(--text-subtle)" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>No grievances found</h3>
                <p style={{ fontSize: '0.85rem' }}>
                  {searchTerm || statusFilter !== 'All' 
                    ? 'No complaints match your active search filters.' 
                    : 'You have not submitted any complaints yet. Use the form on the left to report an issue!'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredReports.map((report) => {
                  const pClass = 
                    report.priority === 'High' ? 'badge-priority-high' :
                    report.priority === 'Medium' ? 'badge-priority-medium' :
                    'badge-priority-low';

                  const sClass = 
                    report.status === 'Resolved' ? 'badge-status-resolved' :
                    report.status === 'In Progress' ? 'badge-status-inprogress' :
                    'badge-status-pending';

                  return (
                    <div
                      key={report.id || report._id}
                      className="glass-card-interactive"
                      onClick={() => setSelectedReport(report)}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`badge ${sClass}`}>{report.status || 'Pending'}</span>
                          <span className={`badge ${pClass}`}>{report.priority || 'Low'}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                        {report.title || report.description?.substring(0, 50) + '...' || 'Civic Issue'}
                      </div>

                      {report.summary && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {report.summary.substring(0, 95)}...
                        </p>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem',
                        color: 'var(--text-subtle)',
                        marginTop: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="var(--color-primary)" />
                          <span>{report.location ? report.location.substring(0, 24) : 'Unspecified'}</span>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: 600 }}>
                          View Details <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case Details Modal */}
      <ReportModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onStatusUpdated={(id, newStatus) => {
          setReports((prev) =>
            prev.map((r) => ((r.id || r._id) === id ? { ...r, status: newStatus } : r))
          );
        }}
      />
    </div>
  );
}
