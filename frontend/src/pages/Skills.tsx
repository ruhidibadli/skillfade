import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { skills as skillsApi } from "../services/api";
import type { Skill } from "../types";
import {
  Plus,
  Target,
  Folder,
  BookOpen,
  Zap,
  ArrowUpRight,
  X,
  Loader2,
  AlertTriangle,
  Link2
} from "lucide-react";

// Status Dot Component
const StatusDot: React.FC<{ freshness?: number }> = ({ freshness }) => {
  const getStatusClass = () => {
    if (!freshness) return "bg-txt-muted";
    if (freshness > 70) return "bg-fresh-base shadow-glow-fresh";
    if (freshness >= 40) return "bg-aging-base shadow-glow-aging";
    return "bg-decayed-base shadow-glow-decayed";
  };

  return <div className={`w-2.5 h-2.5 rounded-full ${getStatusClass()}`} />;
};

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsApi.list();
      setSkills(response.data);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await skillsApi.create({
        name: newSkillName,
        category: newSkillCategory || undefined,
      });
      setShowModal(false);
      setNewSkillName("");
      setNewSkillCategory("");
      fetchSkills();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create skill");
    }
  };

  const getFreshnessColor = (freshness?: number) => {
    if (!freshness) return "text-txt-muted";
    if (freshness > 70) return "text-fresh-base";
    if (freshness >= 40) return "text-aging-base";
    return "text-decayed-base";
  };

  const getFreshnessBarColor = (freshness?: number) => {
    if (!freshness) return "bg-txt-muted";
    if (freshness > 70) return "bg-fresh-base";
    if (freshness >= 40) return "bg-aging-base";
    return "bg-decayed-base";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-txt-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your skills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-display-md text-txt-primary mb-2">Skills</h1>
          <p className="text-txt-secondary">Track the freshness of your expertise</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-400/10 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-accent-400" />
          </div>
          <p className="text-txt-secondary text-lg mb-2">No skills yet</p>
          <p className="text-txt-muted text-sm">Add your first skill to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              to={`/skills/${skill.id}`}
              className="card-interactive p-5 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusDot freshness={skill.freshness} />
                  <h3 className="text-lg font-semibold text-txt-primary group-hover:text-accent-400 transition-colors">
                    {skill.name}
                  </h3>
                </div>
                <ArrowUpRight className="w-4 h-4 text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Category */}
              {skill.category && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Folder className="w-3 h-3 text-txt-muted" />
                  <span className="tag">{skill.category}</span>
                </div>
              )}

              {/* Freshness Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-txt-muted">Freshness</span>
                  <div className="flex items-center gap-2">
                    {skill.below_target && (
                      <span className="tag-accent text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Below target
                      </span>
                    )}
                    <span className={`text-sm font-semibold ${getFreshnessColor(skill.freshness)}`}>
                      {skill.freshness?.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getFreshnessBarColor(skill.freshness)}`}
                    style={{ width: `${skill.freshness || 0}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 pt-3 border-t border-border-subtle">
                {skill.target_freshness !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-txt-muted">Target</span>
                    <span className="text-xs text-txt-secondary">{skill.target_freshness}%</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-txt-muted">Last practiced</span>
                  <span className="text-sm font-medium text-txt-primary">{skill.days_since_practice}d ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-txt-muted">Events</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-txt-secondary">
                      <BookOpen className="w-3 h-3 text-accent-400" />
                      {skill.learning_count}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-txt-secondary">
                      <Zap className="w-3 h-3 text-fresh-base" />
                      {skill.practice_count}
                    </span>
                  </div>
                </div>
                {skill.dependencies && skill.dependencies.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-txt-muted">Prerequisites</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-txt-secondary">
                        <Link2 className="w-3 h-3" />
                        {skill.dependencies.length}
                      </span>
                      {skill.dependencies.some(d => d.freshness !== null && d.freshness < 40) && (
                        <span className="tag text-[10px] bg-decayed-base/10 text-decayed-base border-decayed-base/20">
                          Decaying
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showModal && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-content p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-txt-primary">Add New Skill</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setNewSkillName("");
                  setNewSkillCategory("");
                }}
                className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm animate-slide-down">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSkill} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="input"
                  placeholder="e.g., TypeScript, Piano, Spanish"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2">
                  Category (optional)
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="input"
                  placeholder="e.g., Programming, Music, Language"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                    setNewSkillName("");
                    setNewSkillCategory("");
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
