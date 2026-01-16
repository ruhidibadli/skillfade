import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { skills as skillsApi, categories as categoriesApi } from '../services/api';
import type { Category } from '../types';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  Target,
  Scale,
  BookOpen,
  Zap,
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
  Check,
  Layers,
  TrendingDown,
  Calendar,
  PieChart,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import LogoIcon from './LogoIcon';

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const {
    showOnboarding,
    currentStep,
    totalSteps,
    createdSkillId,
    setCreatedSkillId,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboarding();

  const [isSkipping, setIsSkipping] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Step 6 form state
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [skillNotes, setSkillNotes] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [skillError, setSkillError] = useState('');
  const [skillCreated, setSkillCreated] = useState(false);
  const [createdSkillName, setCreatedSkillName] = useState('');

  // Fetch categories for step 6
  useEffect(() => {
    if (currentStep === 6 && showOnboarding) {
      fetchCategories();
    }
  }, [currentStep, showOnboarding]);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkillError('');

    if (!skillName.trim()) {
      setSkillError('Please enter a skill name');
      return;
    }

    setIsCreatingSkill(true);
    try {
      const data: { name: string; category_id?: string; category_name?: string; notes?: string } = {
        name: skillName.trim()
      };

      if (skillCategory === 'new' && newCategoryName.trim()) {
        data.category_name = newCategoryName.trim();
      } else if (skillCategory && skillCategory !== 'new') {
        data.category_id = skillCategory;
      }

      if (skillNotes.trim()) {
        data.notes = skillNotes.trim();
      }

      const response = await skillsApi.create(data);
      setCreatedSkillId(response.data.id);
      setCreatedSkillName(skillName.trim());
      setSkillCreated(true);
    } catch (err: any) {
      setSkillError(err.response?.data?.detail || 'Failed to create skill');
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await skipOnboarding();
    } finally {
      setIsSkipping(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      navigate('/dashboard');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleGoToDashboard = async () => {
    await handleComplete();
  };

  const handleAddAnotherSkill = async () => {
    await completeOnboarding();
    navigate('/skills');
  };

  const handleViewSkill = async () => {
    if (createdSkillId) {
      await completeOnboarding();
      navigate(`/skills/${createdSkillId}`);
    }
  };

  if (!showOnboarding) return null;

  const progressPercentage = (currentStep / totalSteps) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepWelcome />;
      case 2:
        return <StepPhilosophy />;
      case 3:
        return <StepThreeRealities />;
      case 4:
        return <StepFreshness />;
      case 5:
        return <StepSkillsOverview />;
      case 6:
        return (
          <StepCreateSkill
            skillName={skillName}
            setSkillName={setSkillName}
            skillCategory={skillCategory}
            setSkillCategory={setSkillCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            skillNotes={skillNotes}
            setSkillNotes={setSkillNotes}
            categories={categories}
            isCreatingSkill={isCreatingSkill}
            skillError={skillError}
            skillCreated={skillCreated}
            createdSkillName={createdSkillName}
            onSubmit={handleCreateSkill}
          />
        );
      case 7:
        return <StepEvents />;
      case 8:
        return <StepBalanceRatio />;
      case 9:
        return <StepDashboard />;
      case 10:
        return <StepAnalytics />;
      case 11:
        return <StepQuickLog />;
      case 12:
        return <StepSettings />;
      case 13:
        return (
          <StepComplete
            createdSkillId={createdSkillId}
            createdSkillName={createdSkillName}
            onGoToDashboard={handleGoToDashboard}
            onAddSkill={handleAddAnotherSkill}
            onViewSkill={handleViewSkill}
            isCompleting={isCompleting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content max-w-2xl w-full p-0 overflow-hidden animate-scale-in">
        {/* Progress Bar */}
        <div className="h-1 bg-surface-400">
          <div
            className="h-full bg-gradient-to-r from-accent-400 to-secondary-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <span className="text-sm text-txt-muted">
              Step {currentStep} of {totalSteps}
            </span>
            {/* Step Indicator Dots */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    i + 1 <= currentStep ? 'bg-accent-400' : 'bg-surface-400'
                  }`}
                />
              ))}
            </div>
          </div>
          {currentStep === 1 && (
            <button
              onClick={handleSkip}
              disabled={isSkipping}
              className="text-sm text-txt-muted hover:text-txt-secondary transition-colors flex items-center gap-1"
            >
              {isSkipping ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>Skip Tour</>
              )}
            </button>
          )}
          {currentStep > 1 && currentStep < 13 && (
            <button
              onClick={handleSkip}
              disabled={isSkipping}
              className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"
            >
              {isSkipping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px] flex flex-col">
          <div className="flex-grow onboarding-step-content">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Navigation */}
        {currentStep < 13 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-surface-300/50">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`btn-secondary flex items-center gap-2 ${
                currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 1: Welcome
const StepWelcome: React.FC = () => (
  <div className="text-center space-y-6 animate-slide-up">
    <div className="flex justify-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent animate-pulse-slow">
        <LogoIcon className="w-10 h-10 text-surface-50" />
      </div>
    </div>
    <div>
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Welcome to SkillFade</h2>
      <p className="text-txt-secondary">
        This quick tour will help you understand how SkillFade works and get you started tracking your skills.
      </p>
    </div>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-400/50 rounded-full text-sm text-txt-muted">
      <Clock className="w-4 h-4" />
      ~2 minutes
    </div>
  </div>
);

// Step 2: Philosophy
const StepPhilosophy: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">A Mirror, Not a Coach</h2>
      <p className="text-txt-secondary">
        SkillFade takes a different approach to skill tracking.
      </p>
    </div>
    <div className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="p-2 rounded-lg bg-decayed-base/10 text-decayed-base">
          <X className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-txt-primary">No Streaks or Badges</p>
          <p className="text-sm text-txt-muted">We don't gamify your learning. No pressure to maintain streaks.</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="p-2 rounded-lg bg-decayed-base/10 text-decayed-base">
          <X className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-txt-primary">No Judgment</p>
          <p className="text-sm text-txt-muted">No red warnings or guilt-inducing notifications.</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="p-2 rounded-lg bg-fresh-base/10 text-fresh-base">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-txt-primary">Just Honest Reflection</p>
          <p className="text-sm text-txt-muted">Simply reflects the truth about your skills, kindly and clearly.</p>
        </div>
      </div>
    </div>
  </div>
);

// Step 3: Three Realities
const StepThreeRealities: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Three Realities of Learning</h2>
      <p className="text-txt-secondary">
        SkillFade is built around three uncomfortable truths about skill retention.
      </p>
    </div>
    <div className="grid gap-4">
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent-400/10">
            <Clock className="w-5 h-5 text-accent-400" />
          </div>
          <h3 className="font-semibold text-txt-primary">Learning Decay</h3>
        </div>
        <p className="text-sm text-txt-muted pl-12">
          Skills degrade without reinforcement. What you learned yesterday fades without practice.
        </p>
      </div>
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-secondary-400/10">
            <Target className="w-5 h-5 text-secondary-400" />
          </div>
          <h3 className="font-semibold text-txt-primary">Practice Scarcity</h3>
        </div>
        <p className="text-sm text-txt-muted pl-12">
          Learning without application leads to forgetting. Consuming isn't the same as doing.
        </p>
      </div>
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-aging-base/10">
            <Scale className="w-5 h-5 text-aging-base" />
          </div>
          <h3 className="font-semibold text-txt-primary">Input/Output Imbalance</h3>
        </div>
        <p className="text-sm text-txt-muted pl-12">
          Too much consumption, too little production. Most learners read more than they build.
        </p>
      </div>
    </div>
  </div>
);

// Step 4: Freshness
const StepFreshness: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Understanding Freshness</h2>
      <p className="text-txt-secondary">
        Freshness is the core metric that shows how retained a skill is.
      </p>
    </div>
    <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-txt-muted">Decay Rate</span>
        <span className="font-mono text-accent-400">-2% / day</span>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-txt-secondary">
          Freshness starts at 100% after practice and decays daily without reinforcement. You can customize the decay rate per skill.
        </p>
      </div>
    </div>
    <div className="grid gap-3">
      <div className="flex items-center gap-3 p-3 bg-fresh-base/10 rounded-lg border border-fresh-base/20">
        <div className="status-fresh" />
        <div>
          <span className="font-medium text-fresh-base">Fresh (70-100%)</span>
          <span className="text-sm text-txt-muted ml-2">Recently practiced</span>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-aging-base/10 rounded-lg border border-aging-base/20">
        <div className="status-aging" />
        <div>
          <span className="font-medium text-aging-base">Aging (40-70%)</span>
          <span className="text-sm text-txt-muted ml-2">Needs attention</span>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-decayed-base/10 rounded-lg border border-decayed-base/20">
        <div className="status-decayed" />
        <div>
          <span className="font-medium text-decayed-base">Decayed (&lt;40%)</span>
          <span className="text-sm text-txt-muted ml-2">May need refreshing</span>
        </div>
      </div>
    </div>
  </div>
);

// Step 5: Skills Overview
const StepSkillsOverview: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Tracking Your Skills</h2>
      <p className="text-txt-secondary">
        Skills are the building blocks of SkillFade.
      </p>
    </div>
    <div className="space-y-4">
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <h3 className="font-semibold text-txt-primary mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-400" />
          What can be a skill?
        </h3>
        <p className="text-sm text-txt-muted">
          Programming languages, frameworks, musical instruments, languages, tools, methodologies - anything you want to keep sharp.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-surface-300/50 rounded-lg">
          <p className="text-sm font-medium text-txt-primary">Categories</p>
          <p className="text-xs text-txt-muted">Organize skills into groups</p>
        </div>
        <div className="p-3 bg-surface-300/50 rounded-lg">
          <p className="text-sm font-medium text-txt-primary">Custom Decay</p>
          <p className="text-xs text-txt-muted">Set per-skill decay rates</p>
        </div>
        <div className="p-3 bg-surface-300/50 rounded-lg">
          <p className="text-sm font-medium text-txt-primary">Targets</p>
          <p className="text-xs text-txt-muted">Personal freshness goals</p>
        </div>
        <div className="p-3 bg-surface-300/50 rounded-lg">
          <p className="text-sm font-medium text-txt-primary">Dependencies</p>
          <p className="text-xs text-txt-muted">Link related skills</p>
        </div>
      </div>
      {/* Mock Skill Card */}
      <div className="p-4 bg-surface-400 rounded-xl border border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-txt-primary">React</p>
            <p className="text-xs text-txt-muted">Frontend</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="status-fresh" />
              <span className="font-mono text-fresh-base">87%</span>
            </div>
            <p className="text-xs text-txt-muted">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Step 6: Create First Skill (Interactive)
interface StepCreateSkillProps {
  skillName: string;
  setSkillName: (name: string) => void;
  skillCategory: string;
  setSkillCategory: (category: string) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  skillNotes: string;
  setSkillNotes: (notes: string) => void;
  categories: Category[];
  isCreatingSkill: boolean;
  skillError: string;
  skillCreated: boolean;
  createdSkillName: string;
  onSubmit: (e: React.FormEvent) => void;
}

const StepCreateSkill: React.FC<StepCreateSkillProps> = ({
  skillName,
  setSkillName,
  skillCategory,
  setSkillCategory,
  newCategoryName,
  setNewCategoryName,
  skillNotes,
  setSkillNotes,
  categories,
  isCreatingSkill,
  skillError,
  skillCreated,
  createdSkillName,
  onSubmit
}) => {
  if (skillCreated) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-fresh-base/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-fresh-base" />
          </div>
          <h2 className="text-2xl font-bold text-txt-primary mb-2">Skill Created!</h2>
          <p className="text-txt-secondary">
            "{createdSkillName}" is now being tracked. Practice it to keep it fresh!
          </p>
        </div>
        <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-txt-primary">{createdSkillName}</p>
              <p className="text-xs text-txt-muted">Just created</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="status-neutral" />
                <span className="font-mono text-txt-muted">--</span>
              </div>
              <p className="text-xs text-txt-muted">No practice yet</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-txt-muted text-center">
          Click Continue to learn about logging events.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-txt-primary mb-2">Create Your First Skill</h2>
        <p className="text-txt-secondary">
          Let's track something you're learning or want to keep sharp.
        </p>
      </div>

      {skillError && (
        <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg text-sm">
          {skillError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-txt-secondary mb-2">
            Skill Name *
          </label>
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g., Python, Guitar, Spanish, React..."
            className="input"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-txt-secondary mb-2">
            Category (optional)
          </label>
          <select
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            className="select"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value="new">+ Create new category</option>
          </select>
        </div>

        {skillCategory === 'new' && (
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              New Category Name
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Programming, Music, Languages..."
              className="input"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-txt-secondary mb-2">
            Notes (optional)
          </label>
          <textarea
            value={skillNotes}
            onChange={(e) => setSkillNotes(e.target.value)}
            placeholder="Any notes about this skill..."
            rows={2}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={isCreatingSkill}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isCreatingSkill ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Skill
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-txt-muted text-center">
        You can skip this and create skills later.
      </p>
    </div>
  );
};

// Step 7: Events
const StepEvents: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Learning vs Practice</h2>
      <p className="text-txt-secondary">
        SkillFade distinguishes between two types of events.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-accent-400/10">
            <BookOpen className="w-5 h-5 text-accent-400" />
          </div>
          <h3 className="font-semibold text-txt-primary">Learning (Input)</h3>
        </div>
        <ul className="space-y-1 text-sm text-txt-muted">
          <li>Reading</li>
          <li>Video</li>
          <li>Course</li>
          <li>Article</li>
          <li>Documentation</li>
          <li>Tutorial</li>
        </ul>
      </div>
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-fresh-base/10">
            <Zap className="w-5 h-5 text-fresh-base" />
          </div>
          <h3 className="font-semibold text-txt-primary">Practice (Output)</h3>
        </div>
        <ul className="space-y-1 text-sm text-txt-muted">
          <li>Exercise</li>
          <li>Project</li>
          <li>Work</li>
          <li>Teaching</li>
          <li>Writing</li>
          <li>Building</li>
        </ul>
      </div>
    </div>
    <div className="p-4 bg-accent-400/5 rounded-xl border border-accent-400/20">
      <p className="text-sm text-accent-400 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span><strong>Key insight:</strong> Only practice events restore freshness.</span>
      </p>
    </div>
  </div>
);

// Step 8: Balance Ratio
const StepBalanceRatio: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">The Balance Ratio</h2>
      <p className="text-txt-secondary">
        A simple metric to understand your learning style.
      </p>
    </div>
    <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
      <div className="text-center mb-4">
        <p className="text-sm text-txt-muted mb-1">Formula</p>
        <p className="font-mono text-lg text-txt-primary">
          Practice Events / Learning Events
        </p>
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-surface-300/50 rounded-lg">
        <div className="w-16 text-center">
          <span className="font-mono text-fresh-base">0.5-1.0</span>
        </div>
        <div>
          <p className="text-sm font-medium text-txt-primary">Balanced</p>
          <p className="text-xs text-txt-muted">Ideal ratio for retention</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-surface-300/50 rounded-lg">
        <div className="w-16 text-center">
          <span className="font-mono text-aging-base">&lt;0.2</span>
        </div>
        <div>
          <p className="text-sm font-medium text-txt-primary">Heavy Input</p>
          <p className="text-xs text-txt-muted">Consuming more than doing</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-surface-300/50 rounded-lg">
        <div className="w-16 text-center">
          <span className="font-mono text-accent-400">&gt;1.0</span>
        </div>
        <div>
          <p className="text-sm font-medium text-txt-primary">Practice-Dominant</p>
          <p className="text-xs text-txt-muted">Great for retention</p>
        </div>
      </div>
    </div>
    <p className="text-sm text-txt-muted text-center">
      No judgment, just data to understand your patterns.
    </p>
  </div>
);

// Step 9: Dashboard
const StepDashboard: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Your Dashboard</h2>
      <p className="text-txt-secondary">
        A quick overview of your learning activity.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-txt-primary">Active Skills</span>
        </div>
        <p className="text-2xl font-bold text-txt-primary">--</p>
      </div>
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-secondary-400" />
          <span className="text-sm font-medium text-txt-primary">Balance Ratio</span>
        </div>
        <p className="text-2xl font-bold text-txt-primary">--</p>
      </div>
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-txt-primary">Learning (Week)</span>
        </div>
        <p className="text-2xl font-bold text-txt-primary">--</p>
      </div>
      <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-fresh-base" />
          <span className="text-sm font-medium text-txt-primary">Practice (Week)</span>
        </div>
        <p className="text-2xl font-bold text-txt-primary">--</p>
      </div>
    </div>
    <p className="text-sm text-txt-muted text-center">
      Plus a list of your recent skills sorted by freshness.
    </p>
  </div>
);

// Step 10: Analytics
const StepAnalytics: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Analytics & Insights</h2>
      <p className="text-txt-secondary">
        Deeper visibility into your learning patterns.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-accent-400" />
          <span className="text-sm font-medium text-txt-primary">Activity Calendar</span>
        </div>
        <p className="text-xs text-txt-muted">Monthly view with event counts</p>
      </div>
      <div className="p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-secondary-400" />
          <span className="text-sm font-medium text-txt-primary">Balance Chart</span>
        </div>
        <p className="text-xs text-txt-muted">Weeks/months visualization</p>
      </div>
      <div className="p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <PieChart className="w-4 h-4 text-aging-base" />
          <span className="text-sm font-medium text-txt-primary">Freshness Distribution</span>
        </div>
        <p className="text-xs text-txt-muted">Skills by health status</p>
      </div>
      <div className="p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-fresh-base" />
          <span className="text-sm font-medium text-txt-primary">Category Stats</span>
        </div>
        <p className="text-xs text-txt-muted">Performance by category</p>
      </div>
    </div>
    <div className="p-3 bg-surface-300 rounded-lg border border-border-subtle">
      <div className="flex items-center gap-2 mb-1">
        <TrendingDown className="w-4 h-4 text-accent-400" />
        <span className="text-sm font-medium text-txt-primary">Month Comparison</span>
      </div>
      <p className="text-xs text-txt-muted">Compare this month vs last month</p>
    </div>
  </div>
);

// Step 11: Quick Log
const StepQuickLog: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Quick Log Widget</h2>
      <p className="text-txt-secondary">
        Log events quickly from anywhere in the app.
      </p>
    </div>
    <div className="flex justify-center">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
          <Plus className="w-6 h-6 text-surface-50" />
        </div>
        <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-fresh-base flex items-center justify-center animate-pulse">
          <span className="text-xs font-bold text-surface-50">!</span>
        </div>
      </div>
    </div>
    <div className="p-4 bg-surface-300 rounded-xl border border-border-subtle text-center">
      <p className="text-sm text-txt-secondary mb-2">
        A floating button appears in the bottom-right corner.
      </p>
      <p className="text-sm text-txt-muted">
        Click it to quickly log a learning or practice event without navigating away.
      </p>
    </div>
    <div className="p-4 bg-accent-400/5 rounded-xl border border-accent-400/20">
      <p className="text-sm text-accent-400 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span><strong>Pro tip:</strong> Use Event Templates for even faster logging!</span>
      </p>
    </div>
  </div>
);

// Step 12: Settings
const StepSettings: React.FC = () => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-txt-primary mb-2">Settings & Privacy</h2>
      <p className="text-txt-secondary">
        You're in control of your data.
      </p>
    </div>
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <Settings className="w-5 h-5 text-accent-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-txt-primary">Event Templates</p>
          <p className="text-xs text-txt-muted">Save common events for quick logging</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <ArrowRight className="w-5 h-5 text-secondary-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-txt-primary">Data Export</p>
          <p className="text-xs text-txt-muted">Download all your data as JSON</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-3 bg-surface-300 rounded-lg border border-border-subtle">
        <X className="w-5 h-5 text-decayed-base mt-0.5" />
        <div>
          <p className="text-sm font-medium text-txt-primary">Account Deletion</p>
          <p className="text-xs text-txt-muted">Delete everything permanently</p>
        </div>
      </div>
    </div>
    <div className="p-4 bg-fresh-base/5 rounded-xl border border-fresh-base/20">
      <p className="text-sm text-fresh-base mb-2 font-medium">Privacy First</p>
      <ul className="text-xs text-txt-muted space-y-1">
        <li>• No third-party analytics</li>
        <li>• Full data ownership</li>
        <li>• Optional email alerts only</li>
      </ul>
    </div>
  </div>
);

// Step 13: Complete
interface StepCompleteProps {
  createdSkillId: string | null;
  createdSkillName: string;
  onGoToDashboard: () => void;
  onAddSkill: () => void;
  onViewSkill: () => void;
  isCompleting: boolean;
}

const StepComplete: React.FC<StepCompleteProps> = ({
  createdSkillId,
  createdSkillName,
  onGoToDashboard,
  onAddSkill,
  onViewSkill,
  isCompleting
}) => (
  <div className="space-y-6 animate-slide-up">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-400 to-secondary-400 flex items-center justify-center shadow-glow-accent">
        <Check className="w-8 h-8 text-surface-50" />
      </div>
      <h2 className="text-2xl font-bold text-txt-primary mb-2">You're All Set!</h2>
      <p className="text-txt-secondary">
        You now know everything you need to start tracking your skills.
      </p>
    </div>

    {createdSkillId && (
      <div className="p-4 bg-fresh-base/5 rounded-xl border border-fresh-base/20 text-center">
        <p className="text-sm text-fresh-base">
          Your first skill "{createdSkillName}" is ready to track!
        </p>
      </div>
    )}

    <div className="space-y-3">
      <button
        onClick={onGoToDashboard}
        disabled={isCompleting}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isCompleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </>
        )}
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddSkill}
          disabled={isCompleting}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
        {createdSkillId && (
          <button
            onClick={onViewSkill}
            disabled={isCompleting}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            View Skill
          </button>
        )}
      </div>
    </div>

    <p className="text-sm text-txt-muted text-center">
      You can view this tour again from Settings.
    </p>
  </div>
);

export default OnboardingWizard;
