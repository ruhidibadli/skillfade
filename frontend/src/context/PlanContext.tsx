import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { billing } from '../services/api';
import { useAuth } from './AuthContext';
import type { Plan, PlanLimits, PlanResponse } from '../types';

interface PlanContextValue {
  plan: Plan;
  isPro: boolean;
  status: 'active' | null;
  purchasedAt: string | null;
  refundedAt: string | null;
  amount: number | null;
  currency: string;
  limits: PlanLimits;
  loading: boolean;
  refresh: () => Promise<void>;
}

const FREE_LIMITS: PlanLimits = {
  skills: 3,
  categories: 2,
  templates: 2,
  history_days: 30,
};

const GUEST_STATE: Omit<PlanContextValue, 'refresh'> = {
  plan: 'free',
  isPro: false,
  status: null,
  purchasedAt: null,
  refundedAt: null,
  amount: null,
  currency: 'AZN',
  limits: FREE_LIMITS,
  loading: false,
};

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [state, setState] = useState<Omit<PlanContextValue, 'refresh'>>(GUEST_STATE);

  const applyResponse = useCallback((data: PlanResponse) => {
    setState({
      plan: data.plan,
      isPro: data.is_pro,
      status: data.status,
      purchasedAt: data.purchased_at,
      refundedAt: data.refunded_at,
      amount: data.amount,
      currency: data.currency,
      limits: data.limits,
      loading: false,
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setState(GUEST_STATE);
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    try {
      const response = await billing.me();
      applyResponse(response.data);
    } catch {
      setState({ ...GUEST_STATE, loading: false });
    }
  }, [isAuthenticated, applyResponse]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setState(GUEST_STATE);
      return;
    }
    refresh();
  }, [authLoading, isAuthenticated, refresh]);

  return (
    <PlanContext.Provider value={{ ...state, refresh }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = (): PlanContextValue => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
