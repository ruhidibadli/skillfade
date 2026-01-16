import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settings as settingsApi } from '../services/api';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  showOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
  createdSkillId: string | null;
  setCurrentStep: (step: number) => void;
  setCreatedSkillId: (id: string | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  restartOnboarding: () => void;
  isLoading: boolean;
}

const TOTAL_STEPS = 13;

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdSkillId, setCreatedSkillId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        setShowOnboarding(false);
        return;
      }

      try {
        const response = await settingsApi.get();
        const userSettings = response.data.settings || {};
        const hasCompleted = userSettings.hasCompletedOnboarding === true;

        if (!hasCompleted && !hasChecked) {
          setShowOnboarding(true);
          setCurrentStep(1);
        }
        setHasChecked(true);
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
        // On error, don't show onboarding to avoid blocking the user
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, hasChecked]);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const markOnboardingComplete = async () => {
    try {
      await settingsApi.update({
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      throw error;
    }
  };

  const skipOnboarding = async () => {
    await markOnboardingComplete();
    setShowOnboarding(false);
    setCurrentStep(1);
    setCreatedSkillId(null);
  };

  const completeOnboarding = async () => {
    await markOnboardingComplete();
    setShowOnboarding(false);
    setCurrentStep(1);
  };

  const restartOnboarding = useCallback(() => {
    setCurrentStep(1);
    setCreatedSkillId(null);
    setShowOnboarding(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        currentStep,
        totalSteps: TOTAL_STEPS,
        createdSkillId,
        setCurrentStep,
        setCreatedSkillId,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        restartOnboarding,
        isLoading
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
