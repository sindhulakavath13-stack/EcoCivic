import React, { useState } from 'react';
import { resolveImageUrl, updateReportStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Tag, 
  Image as ImageIcon, 
  ExternalLink,
  User,
  Activity
} from 'lucide-react';

export default function ReportModal({ report, isOpen, onClose, onStatusUpdated }) {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(report?.status || 'Pending');

  if (!isOpen || !report) return null;

  const imageUrl = resolveImageUrl(report.imagePath || report.image);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateReportStatus(report.id || report._id, newStatus);
      setCurrentStatus(newStatus);
      success(`Report status updated to ${newStatus}`);
      if (onStatusUpdated) onStatusUpdated(report.id || report._id, newStatus);
    } catch (err) {
      console.error('Status update failed:', err);
      error(err.message || 'Failed to update report status');
    } finally {
      setUpdating(false);
    }
  };

  const priorityClass = 
    report.priority === 'High' ? 'badge-priority-high' :
    report.priority === 'Medium' ? 'badge-priority-medium' :
    'badge-priority-low';

  const statusClass = 
    currentStatus === 'Resolved' ? 'badge-status-resolved' :
    currentStatus === 'In Progress' ? 'badge-status-inprogress' :
    'badge-status-pending';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '640px', padding: '32px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-eco">CASE #{report.id || report._id || '---'}</span>
              <span className={`badge ${priorityClass}`}>{report.priority || 'Low'} Priority</span>
              <span className={`badge ${statusClass}`}>{currentStatus}</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', marginTop: '4px' }}>
              {report.title || report.description?.substring(0, 45) + '...' || 'Civic Grievance Case'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4
            }}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Admin Status Quick Action Bar */}
        {isAdmin && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600 }}>
              <Activity size={18} color="var(--color-primary)" />
              <span>Update Workflow Status:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Pending', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  disabled={updating || currentStatus === st}
                  onClick={() => handleStatusChange(st)}
                  className={`btn btn-sm ${currentStatus === st ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Intelligence Box */}
        {(report.summary || report.sustainabilityArea) && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Grievance Insights
              </span>
            </div>
            {report.summary && (
              <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '8px' }}>
                {report.summary}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {report.category && (
                <span className="badge" style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  Category: {report.category}
                </span>
              )}
              {report.subcategory && (
                <span className="badge" style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  Subcategory: {report.subcategory}
                </span>
              )}
              {report.sustainabilityArea && (
                <span className="badge badge-eco">
                  Focus: {report.sustainabilityArea}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Complaint Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Full Grievance Statement
          </label>
          <p style={{ 
            marginTop: '6px', 
            fontSize: '0.95rem', 
            color: 'var(--text-main)', 
            lineHeight: 1.6,
            background: 'var(--bg-surface)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            {report.description || report.complaint || 'No detailed statement provided.'}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <MapPin size={18} color="var(--color-primary)" />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Location</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{report.location || 'Unspecified'}</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <Calendar size={18} color="var(--color-accent)" />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Reported On</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Recent'}
              </div>
            </div>
          </div>

          {report.user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              <User size={18} color="#a855f7" />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Submitted By</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                  {typeof report.user === 'object' ? (report.user.name || report.user.email) : report.user}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Evidence Image */}
        {imageUrl && (
          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ImageIcon size={15} /> Uploaded Evidence
            </label>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              maxHeight: '280px',
              background: '#000000'
            }}>
              <img
                src={imageUrl}
                alt="Complaint Attachment"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  maxHeight: '280px',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
