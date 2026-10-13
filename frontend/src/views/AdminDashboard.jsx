import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchAllReports, updateReportStatus, generateCivicInsights } from '../services/api';
import { CategoryChart, PriorityChart, LocationChart, SustainabilityChart } from '../components/Charts';
import ReportModal from '../components/ReportModal';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Sparkles, 
  Layers, 
  Eye, 
  FileSpreadsheet, 
  Activity,
  ArrowUpDown
} from 'lucide-react';

export default function AdminDashboard({ onOpenAuthModal }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // AI Insights State
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insightsText, setInsightsText] = useState(null);

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await fetchAllReports();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      error(err.message || 'Failed to load complaints from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle inline status change
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      setComplaints((prev) =>
        prev.map((c) => ((c.id || c._id) === reportId ? { ...c, status: newStatus } : c))
      );
      success(`Case #${reportId} updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update failed:', err);
      error(err.message || 'Failed to update complaint status');
    }
  };

  // AI Insight Generator
  const handleGenerateInsights = async () => {
    if (complaints.length === 0) {
      info('No complaints available to analyze yet.');
      return;
    }
    setGeneratingInsights(true);
    info('Gemini AI is analyzing grievance distributions & environmental trends...');

    try {
      const statsSummary = {
        totalCases: complaints.length,
        highPriorityCases: complaints.filter((c) => c.priority === 'High').length,
        pendingCases: complaints.filter((c) => c.status === 'Pending').length,
        resolvedCases: complaints.filter((c) => c.status === 'Resolved').length,
        categories: complaints.map((c) => c.category).filter(Boolean),
        locations: complaints.map((c) => c.location).filter(Boolean),
        sustainabilityAreas: complaints.map((c) => c.sustainabilityArea || c.sustainability_area).filter(Boolean)
      };

      const result = await generateCivicInsights(statsSummary);
      setInsightsText(result.response || result.message || JSON.stringify(result));
      success('AI Municipal Insights generated!');
    } catch (err) {
      console.error('AI Insights error:', err);
      error(err.message || 'Failed to generate AI insights.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (complaints.length === 0) {
      info('No complaints data to export.');
      return;
    }

    const headers = ['ID', 'Title', 'Description', 'Category', 'Subcategory', 'Priority', 'Status', 'Location', 'Sustainability Area', 'Created At'];
    const rows = filteredComplaints.map((c) => [
      c.id || c._id || '',
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.description || c.complaint || '').replace(/"/g, '""')}"`,
      `"${c.category || ''}"`,
      `"${c.subcategory || ''}"`,
      c.priority || '',
      c.status || '',
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${c.sustainabilityArea || c.sustainability_area || ''}"`,
      c.createdAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EcoCivic_Grievances_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Complaints CSV exported successfully!');
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setStatusFilter('All');
  };

  // Unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(complaints.map((c) => c.category).filter(Boolean))
  );

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (c.id && String(c.id).toLowerCase().includes(s)) ||
      (c.title && c.title.toLowerCase().includes(s)) ||
      ((c.description || c.complaint) && (c.description || c.complaint).toLowerCase().includes(s)) ||
      (c.category && c.category.toLowerCase().includes(s)) ||
      (c.subcategory && c.subcategory.toLowerCase().includes(s)) ||
      (c.priority && c.priority.toLowerCase().includes(s)) ||
      (c.location && c.location.toLowerCase().includes(s)) ||
      ((c.sustainabilityArea || c.sustainability_area) && (c.sustainabilityArea || c.sustainability_area).toLowerCase().includes(s)) ||
      (c.status && c.status.toLowerCase().includes(s));

    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // KPI calculations
  const totalComplaints = complaints.length;
  const highPriority = complaints.filter((c) => c.priority === 'High').length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '540px', margin: '0 auto', padding: '48px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--priority-high)'
          }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Administrative Access Required</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
            The municipal intelligence dashboard is restricted to authorized civic administrators and ecological officers.
          </p>
          <button onClick={onOpenAuthModal} className="btn btn-primary btn-lg">
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '60px', paddingTop: '28px' }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-priority-high" style={{ padding: '4px 8px' }}>MUNICIPAL HQ</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Real-time telemetry</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', margin: '4px 0 0' }}>
            Sustainability Command Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '2px' }}>
            Intelligent grievance prioritization, cross-ward analytics, and ecological trend insights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadData} disabled={loading} className="btn btn-outline" style={{ gap: '6px' }}>
            <RefreshCw size={16} className={loading ? 'pulse-glow' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button onClick={exportToCSV} className="btn btn-outline" style={{ gap: '6px' }}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleGenerateInsights}
            disabled={generatingInsights}
            className="btn btn-primary"
            style={{ gap: '6px' }}
          >
            <Sparkles size={16} />
            <span>{generatingInsights ? 'Analyzing Trends...' : 'AI Insights'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Complaints</span>
            <Layers size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
            {totalComplaints}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-primary)', marginTop: '2px' }}>
            City-wide reported cases
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>High Priority Urgency</span>
            <AlertTriangle size={18} color="var(--priority-high)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', color: 'var(--priority-high)' }}>
            {highPriority}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--priority-high)', marginTop: '2px' }}>
            Critical ecological hazards
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Inspection</span>
            <Clock size={18} color="var(--status-pending)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', color: 'var(--status-pending)' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
            Requires field verification
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>In Remediation</span>
            <Activity size={18} color="var(--status-inprogress)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', color: 'var(--status-inprogress)' }}>
            {inProgressCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
            Active municipal work orders
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Resolved Cases</span>
            <CheckCircle2 size={18} color="var(--status-resolved)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', color: 'var(--status-resolved)' }}>
            {resolvedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--status-resolved)', marginTop: '2px' }}>
            {totalComplaints > 0 ? `${Math.round((resolvedCount / totalComplaints) * 100)}% resolution rate` : '0%'}
          </div>
        </div>
      </div>

      {/* AI Insights Card (if generated) */}
      {insightsText && (
        <div className="glass-card" style={{
          padding: '24px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Gemini AI Executive Trend Insights</h3>
            </div>
            <button
              onClick={() => setInsightsText(null)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Dismiss
            </button>
          </div>
          <p style={{
            fontSize: '0.94rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            whiteSpace: 'pre-line'
          }}>
            {insightsText}
          </p>
        </div>
      )}

      {/* Visual Analytics Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Complaints by Category</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>AI-classified ecological issue distribution</p>
          <CategoryChart complaints={complaints} />
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Urgency Priority Distribution</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Urgency levels evaluated by severity matrix</p>
          <PriorityChart complaints={complaints} />
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Geographic Hotspots</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Top wards & locations reporting incidents</p>
          <LocationChart complaints={complaints} />
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Sustainability Impact Areas</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Impact domain (Water, Air, Waste, Green Cover)</p>
          <SustainabilityChart complaints={complaints} />
        </div>
      </div>

      {/* Interactive Case Management Table */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Case Files & Grievance Registry</h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {filteredComplaints.length} of {complaints.length} municipal records
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '8px 12px 8px 34px', fontSize: '0.85rem' }}
                placeholder="Search case, ward..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Category Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="btn btn-outline btn-sm"
              style={{ padding: '8px 12px' }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.88rem'
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '12px 14px' }}>Case</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Priority</th>
                <th style={{ padding: '12px 14px' }}>Location</th>
                <th style={{ padding: '12px 14px' }}>Workflow Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 14px', color: 'var(--text-muted)' }}>
                    No records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const id = c.id || c._id;
                  const pClass =
                    c.priority === 'High' ? 'badge-priority-high' :
                    c.priority === 'Medium' ? 'badge-priority-medium' :
                    'badge-priority-low';

                  return (
                    <tr
                      key={id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.title || c.description || c.complaint || 'Untitled Issue'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                          #{id} • {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.category || 'General'}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>{c.subcategory || 'Unassigned'}</div>
                      </td>

                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${pClass}`}>{c.priority || 'Low'}</span>
                      </td>

                      <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                        {c.location || 'Unknown'}
                      </td>

                      <td style={{ padding: '14px' }}>
                        <select
                          className="form-select"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.82rem',
                            width: '130px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          value={c.status || 'Pending'}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedReport(c)}
                          className="btn btn-outline btn-sm"
                          style={{ gap: '4px' }}
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Modal */}
      <ReportModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onStatusUpdated={(id, newStatus) => {
          setComplaints((prev) =>
            prev.map((c) => ((c.id || c._id) === id ? { ...c, status: newStatus } : c))
          );
        }}
      />
    </div>
  );
}
