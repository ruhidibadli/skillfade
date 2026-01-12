import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analytics, skills as skillsApi } from '../services/api';
import type { DashboardData, Skill } from '../types';
import {
  Target,
  Calendar,
  Scale,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Zap,
  Folder,
  Loader2
} from 'lucide-react';

// Status Dot Component
const StatusDot: React.FC<{ freshness?: number; size?: 'sm' | 'md' }> = ({ freshness, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  const getStatusClass = () => {
    if (!freshness) return 'bg-txt-muted';
    if (freshness > 70) return 'bg-fresh-base shadow-glow-fresh';
    if (freshness >= 40) return 'bg-aging-base shadow-glow-aging';
    return 'bg-decayed-base shadow-glow-decayed';
  };

  return <div className={`${sizeClass} rounded-full ${getStatusClass()}`} />;
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashboardRes, skillsRes] = await Promise.all([
        analytics.dashboard(),
        skillsApi.list()
      ]);
      setData(dashboardRes.data);
      setSkills(skillsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-txt-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const getFreshnessColor = (freshness?: number) => {
    if (!freshness) return 'text-txt-muted';
    if (freshness > 70) return 'text-fresh-base';
    if (freshness >= 40) return 'text-aging-base';
    return 'text-decayed-base';
  };

  const getFreshnessBarColor = (freshness?: number) => {
    if (!freshness) return 'bg-txt-muted';
    if (freshness > 70) return 'bg-fresh-base';
    if (freshness >= 40) return 'bg-aging-base';
    return 'bg-decayed-base';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-md text-txt-primary mb-2">Dashboard</h1>
        <p className="text-txt-secondary">A calm reflection of your learning journey</p>
      </div>

      {/* Stats Grid - Asymmetric */}
      {data && (
        <div className="grid grid-cols-12 gap-4">
          {/* Active Skills */}
          <div className="col-span-12 md:col-span-5 card-elevated p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-txt-secondary text-sm mb-1">Active Skills</p>
                <p className="text-display-md text-gradient-accent">{data.total_skills}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent-400/10">
                <Target className="w-6 h-6 text-accent-400" />
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="col-span-12 md:col-span-4 card-elevated p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-txt-muted" />
              <p className="text-txt-secondary text-sm">This Week</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-txt-muted text-sm flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-accent-400" />
                  Learning
                </span>
                <span className="text-lg font-semibold text-accent-400">{data.learning_events_this_week}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-txt-muted text-sm flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-fresh-base" />
                  Practice
                </span>
                <span className="text-lg font-semibold text-fresh-base">{data.practice_events_this_week}</span>
              </div>
            </div>
          </div>

          {/* Balance Ratio */}
          <div className="col-span-12 md:col-span-3 card-elevated p-6">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-txt-muted" />
              <p className="text-txt-secondary text-sm">Balance</p>
            </div>
            <p className="text-display-sm text-secondary-400">{data.weekly_balance_ratio}</p>
            <p className="text-txt-muted text-xs mt-2">{data.balance_interpretation}</p>
          </div>
        </div>
      )}

      {/* Recent Skills */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-txt-primary">Recent Skills</h2>
          <Link
            to="/skills"
            className="text-accent-400 hover:text-accent-300 font-medium flex items-center gap-2 text-sm transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-accent-400/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-accent-400" />
            </div>
            <p className="text-txt-secondary text-lg mb-6">No skills yet. Start your journey!</p>
            <Link
              to="/skills"
              className="btn-primary inline-flex items-center gap-2"
            >
              Add Your First Skill
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <Link
                key={skill.id}
                to={`/skills/${skill.id}`}
                className="block p-4 card-interactive group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusDot freshness={skill.freshness} />
                      <h3 className="font-semibold text-txt-primary group-hover:text-accent-400 transition-colors truncate">
                        {skill.name}
                      </h3>
                    </div>
                    {skill.category && (
                      <div className="flex items-center gap-1.5 ml-5">
                        <Folder className="w-3 h-3 text-txt-muted" />
                        <span className="tag text-xs">{skill.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className={`text-lg font-semibold ${getFreshnessColor(skill.freshness)}`}>
                      {skill.freshness?.toFixed(0)}%
                    </p>
                    <p className="text-xs text-txt-muted mt-1">
                      {skill.days_since_practice}d ago
                    </p>
                  </div>
                </div>

                {/* Freshness Bar */}
                <div className="mt-3 ml-5">
                  <div className="h-1 bg-surface-400 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getFreshnessBarColor(skill.freshness)}`}
                      style={{ width: `${skill.freshness || 0}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
