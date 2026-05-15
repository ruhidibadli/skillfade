import { usePlan } from '../context/PlanContext';
import type { PlanLimits } from '../types';

export { usePlan };

export const useIsPro = (): boolean => usePlan().isPro;

export const useFeatureLimit = (
  limit: keyof PlanLimits,
): number | null => usePlan().limits[limit];
