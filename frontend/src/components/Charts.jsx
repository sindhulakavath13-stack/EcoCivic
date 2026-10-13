import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function CategoryChart({ complaints = [] }) {
  const counts = {};
  complaints.forEach((c) => {
    const cat = c.category || 'Uncategorized';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const dataValues = Object.values(counts);

  const data = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [
      {
        label: 'Grievance Count',
        data: labels.length ? dataValues : [0],
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 8,
        hoverBackgroundColor: '#10b981'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    }
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export function PriorityChart({ complaints = [] }) {
  const counts = { High: 0, Medium: 0, Low: 0 };
  complaints.forEach((c) => {
    const p = c.priority || 'Low';
    if (counts[p] !== undefined) counts[p]++;
    else counts.Low++;
  });

  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Complaints',
        data: [counts.High, counts.Medium, counts.Low],
        backgroundColor: [
          'rgba(244, 63, 94, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(16, 185, 129, 0.85)'
        ],
        borderColor: ['#f43f5e', '#f59e0b', '#10b981'],
        borderWidth: 1.5,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12 },
          usePointStyle: true,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10
      }
    },
    cutout: '68%'
  };

  return (
    <div style={{ height: '260px', width: '100%', position: 'relative' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function LocationChart({ complaints = [] }) {
  const counts = {};
  complaints.forEach((c) => {
    const loc = c.location || 'Unknown';
    counts[loc] = (counts[loc] || 0) + 1;
  });

  // Top 5 locations
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = sorted.map((s) => s[0]);
  const values = sorted.map((s) => s[1]);

  const data = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [
      {
        label: 'Grievance Reports',
        data: labels.length ? values : [0],
        backgroundColor: 'rgba(6, 182, 212, 0.75)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    }
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export function SustainabilityChart({ complaints = [] }) {
  const counts = {};
  complaints.forEach((c) => {
    const area = c.sustainabilityArea || c.sustainability_area || 'General Civic';
    counts[area] = (counts[area] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const values = Object.values(counts);

  const data = {
    labels: labels.length ? labels : ['No Data'],
    datasets: [
      {
        label: 'Impact Reports',
        data: labels.length ? values : [0],
        backgroundColor: 'rgba(139, 92, 246, 0.75)',
        borderColor: '#8b5cf6',
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', stepSize: 1, font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    }
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
