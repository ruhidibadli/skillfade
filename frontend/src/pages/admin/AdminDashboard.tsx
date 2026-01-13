import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../services/api';
import type { AdminDashboardStats } from '../../types';
import {
  Users,
  Layers,
  FolderOpen,
  BookOpen,
  Wrench,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await admin.getStats();
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-txt-muted">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-6 text-center">
        <p className="text-decayed-base">{error}</p>
        <button onClick={fetchStats} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, link: '/admin/users', color: 'text-accent-400' },
    { label: 'Total Skills', value: stats?.total_skills || 0, icon: Layers, link: '/admin/skills', color: 'text-secondary-400' },
    { label: 'Categories', value: stats?.total_categories || 0, icon: FolderOpen, link: '/admin/categories', color: 'text-fresh-base' },
    { label: 'Learning Events', value: stats?.total_learning_events || 0, icon: BookOpen, link: '/admin/learning-events', color: 'text-accent-300' },
    { label: 'Practice Events', value: stats?.total_practice_events || 0, icon: Wrench, link: '/admin/practice-events', color: 'text-fresh-bright' },
    { label: 'Templates', value: stats?.total_templates || 0, icon: FileText, link: '/admin/templates', color: 'text-aging-base' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-txt-primary">Admin Dashboard</h1>
        <p className="text-txt-muted mt-1">Overview of all system data</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="card-elevated p-6 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-txt-muted text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-surface-300 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-400" />
            <h2 className="text-lg font-semibold text-txt-primary">New Users (7 days)</h2>
          </div>
          <p className="text-4xl font-bold text-accent-400">{stats?.users_last_7_days || 0}</p>
          <p className="text-txt-muted text-sm mt-1">new registrations</p>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-fresh-base" />
            <h2 className="text-lg font-semibold text-txt-primary">Events (7 days)</h2>
          </div>
          <p className="text-4xl font-bold text-fresh-base">{stats?.events_last_7_days || 0}</p>
          <p className="text-txt-muted text-sm mt-1">learning & practice events</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-txt-primary mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/users" className="btn-primary">
            Manage Users
          </Link>
          <Link to="/admin/skills" className="btn-secondary">
            View All Skills
          </Link>
          <Link to="/admin/learning-events" className="btn-ghost">
            Learning Events
          </Link>
          <Link to="/admin/practice-events" className="btn-ghost">
            Practice Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
