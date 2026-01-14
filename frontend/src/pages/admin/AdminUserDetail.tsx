import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { admin } from '../../services/api';
import type { AdminUserFullDetails } from '../../types';
import {
  ArrowLeft,
  User,
  BookOpen,
  Target,
  FolderOpen,
  FileText,
  Shield,
  ShieldOff,
  Activity,
  TrendingUp
} from 'lucide-react';

type TabType = 'overview' | 'skills' | 'learning' | 'practice' | 'categories' | 'templates';

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminUserFullDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await admin.getUserFullDetails(userId);
        setData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const getFreshnessColor = (freshness: number) => {
    if (freshness >= 70) return 'text-fresh-base';
    if (freshness >= 40) return 'text-aging-base';
    return 'text-decayed-base';
  };

  const getFreshnessBg = (freshness: number) => {
    if (freshness >= 70) return 'bg-fresh-base/10';
    if (freshness >= 40) return 'bg-aging-base/10';
    return 'bg-decayed-base/10';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Target className="w-4 h-4" />, count: data?.summary.total_skills },
    { id: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" />, count: data?.summary.total_learning_events },
    { id: 'practice', label: 'Practice', icon: <TrendingUp className="w-4 h-4" />, count: data?.summary.total_practice_events },
    { id: 'categories', label: 'Categories', icon: <FolderOpen className="w-4 h-4" />, count: data?.summary.total_categories },
    { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" />, count: data?.summary.total_templates }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-txt-muted">Loading user details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-txt-muted hover:text-txt-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
        <div className="bg-decayed-base/10 text-decayed-base px-4 py-3 rounded-lg">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-txt-muted hover:text-txt-primary transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-400/10 flex items-center justify-center">
              <User className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-txt-primary">{data.user.email}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  data.user.is_admin
                    ? 'bg-accent-400/10 text-accent-400'
                    : 'bg-surface-300 text-txt-muted'
                }`}>
                  {data.user.is_admin ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                  {data.user.is_admin ? 'Admin' : 'User'}
                </span>
                <span className="text-txt-muted text-sm">
                  Joined {new Date(data.user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent-400 text-accent-400'
                  : 'border-transparent text-txt-muted hover:text-txt-primary hover:border-border-DEFAULT'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? 'bg-accent-400/10' : 'bg-surface-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-elevated p-4">
                <div className="text-txt-muted text-sm">Active Skills</div>
                <div className="text-2xl font-bold text-txt-primary mt-1">{data.summary.active_skills}</div>
                {data.summary.archived_skills > 0 && (
                  <div className="text-txt-muted text-xs mt-1">+{data.summary.archived_skills} archived</div>
                )}
              </div>
              <div className="card-elevated p-4">
                <div className="text-txt-muted text-sm">Avg Freshness</div>
                <div className={`text-2xl font-bold mt-1 ${getFreshnessColor(data.summary.average_freshness)}`}>
                  {data.summary.average_freshness}%
                </div>
              </div>
              <div className="card-elevated p-4">
                <div className="text-txt-muted text-sm">Total Learning</div>
                <div className="text-2xl font-bold text-blue-500 mt-1">{data.summary.total_learning_events}</div>
                <div className="text-txt-muted text-xs mt-1">
                  {formatDuration(data.summary.total_learning_minutes)} total
                </div>
              </div>
              <div className="card-elevated p-4">
                <div className="text-txt-muted text-sm">Total Practice</div>
                <div className="text-2xl font-bold text-green-500 mt-1">{data.summary.total_practice_events}</div>
                <div className="text-txt-muted text-xs mt-1">
                  {formatDuration(data.summary.total_practice_minutes)} total
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-elevated p-4">
              <h3 className="font-semibold text-txt-primary mb-3">Last 30 Days Activity</h3>
              <div className="flex gap-8">
                <div>
                  <span className="text-blue-500 font-bold text-xl">{data.summary.recent_learning_events}</span>
                  <span className="text-txt-muted text-sm ml-2">learning events</span>
                </div>
                <div>
                  <span className="text-green-500 font-bold text-xl">{data.summary.recent_practice_events}</span>
                  <span className="text-txt-muted text-sm ml-2">practice events</span>
                </div>
              </div>
            </div>

            {/* Top Skills by Freshness */}
            {data.skills.length > 0 && (
              <div className="card-elevated p-4">
                <h3 className="font-semibold text-txt-primary mb-3">Skills Overview</h3>
                <div className="space-y-2">
                  {data.skills
                    .filter(s => !s.archived_at)
                    .slice(0, 5)
                    .map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            skill.freshness >= 70 ? 'bg-fresh-base' :
                            skill.freshness >= 40 ? 'bg-aging-base' : 'bg-decayed-base'
                          }`} />
                          <span className="text-txt-primary">{skill.name}</span>
                          {skill.category_name && (
                            <span className="text-txt-muted text-xs px-2 py-0.5 bg-surface-300 rounded">
                              {skill.category_name}
                            </span>
                          )}
                        </div>
                        <div className={`font-medium ${getFreshnessColor(skill.freshness)}`}>
                          {skill.freshness.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                </div>
                {data.skills.filter(s => !s.archived_at).length > 5 && (
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="text-accent-400 text-sm mt-3 hover:underline"
                  >
                    View all {data.skills.filter(s => !s.archived_at).length} skills
                  </button>
                )}
              </div>
            )}

            {/* User Settings */}
            {Object.keys(data.user.settings).length > 0 && (
              <div className="card-elevated p-4">
                <h3 className="font-semibold text-txt-primary mb-3">User Settings</h3>
                <pre className="text-sm text-txt-secondary bg-surface-300 p-3 rounded overflow-auto">
                  {JSON.stringify(data.user.settings, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            {data.skills.length === 0 ? (
              <div className="text-center py-12 text-txt-muted">
                No skills found for this user
              </div>
            ) : (
              <div className="card-elevated overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Skill</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Freshness</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Learning</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Practice</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.skills.map((skill) => (
                      <tr key={skill.id} className="hover:bg-surface-300/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-txt-primary font-medium">{skill.name}</div>
                          {skill.notes && (
                            <div className="text-txt-muted text-xs truncate max-w-[200px]">{skill.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-secondary">
                          {skill.category_name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getFreshnessBg(skill.freshness)} ${getFreshnessColor(skill.freshness)}`}>
                            {skill.freshness.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-500">{skill.learning_events_count}</td>
                        <td className="px-4 py-3 text-sm text-green-500">{skill.practice_events_count}</td>
                        <td className="px-4 py-3 text-sm text-txt-muted">
                          {new Date(skill.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            skill.archived_at
                              ? 'bg-surface-300 text-txt-muted'
                              : 'bg-fresh-base/10 text-fresh-base'
                          }`}>
                            {skill.archived_at ? 'Archived' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learning' && (
          <div className="space-y-4">
            {data.learning_events.length === 0 ? (
              <div className="text-center py-12 text-txt-muted">
                No learning events found for this user
              </div>
            ) : (
              <div className="card-elevated overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Skill</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.learning_events.map((event) => (
                      <tr key={event.id} className="hover:bg-surface-300/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-txt-primary">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-secondary">
                          {event.skill_name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs capitalize">
                            {event.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-muted">
                          {event.duration_minutes ? formatDuration(event.duration_minutes) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-muted truncate max-w-[200px]">
                          {event.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            {data.practice_events.length === 0 ? (
              <div className="text-center py-12 text-txt-muted">
                No practice events found for this user
              </div>
            ) : (
              <div className="card-elevated overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Skill</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.practice_events.map((event) => (
                      <tr key={event.id} className="hover:bg-surface-300/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-txt-primary">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-secondary">
                          {event.skill_name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs capitalize">
                            {event.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-muted">
                          {event.duration_minutes ? formatDuration(event.duration_minutes) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-txt-muted truncate max-w-[200px]">
                          {event.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            {data.categories.length === 0 ? (
              <div className="text-center py-12 text-txt-muted">
                No categories found for this user
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.categories.map((category) => (
                  <div key={category.id} className="card-elevated p-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-accent-400" />
                      <h3 className="font-medium text-txt-primary">{category.name}</h3>
                    </div>
                    <div className="mt-2 text-sm text-txt-muted">
                      {category.skills_count} skill{category.skills_count !== 1 ? 's' : ''}
                    </div>
                    <div className="mt-1 text-xs text-txt-muted">
                      Created {new Date(category.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            {data.templates.length === 0 ? (
              <div className="text-center py-12 text-txt-muted">
                No templates found for this user
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.templates.map((template) => (
                  <div key={template.id} className="card-elevated p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-txt-primary">{template.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        template.event_type === 'learning'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {template.event_type}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-txt-secondary capitalize">
                      Type: {template.type}
                    </div>
                    {template.default_duration_minutes && (
                      <div className="mt-1 text-sm text-txt-muted">
                        Default duration: {formatDuration(template.default_duration_minutes)}
                      </div>
                    )}
                    {template.default_notes && (
                      <div className="mt-1 text-sm text-txt-muted truncate">
                        Notes: {template.default_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail;
